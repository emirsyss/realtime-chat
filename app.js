const express = require("express");
const fs = require("fs");
const mysql = require("mysql2");
const session = require("express-session");
const bodyParser = require("body-parser");
const crypto = require('crypto');
const app = express();
const socket = require('socket.io');
const port = 3000; // dinlenecek port

const server = app.listen(port, () => {
    console.log("Sunucu " + port + " portunda çalışıyor.");
});

const io = socket(server);

//MySQL bağlantısı kurma
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "realtime-chat-php"
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));  // public klasöründeki dosyaları istemciye tanıtmak

const public = __dirname + "/public/chat/";
const public2 = __dirname + "/public/";
const public3 = __dirname + "/public/profile/";

app.get("/login", async (req, res) => { // localhost:3000/login bağlantısına gidince login.html'i ekrana yansıt
    res.sendFile(public2 + "login.html");
})
app.get("/register", async (req, res) => { // localhost:3000/register bağlantısına gidince register.html'i ekrana yansıt
    res.sendFile(public2 + "register.html");
})

app.post("/loginpost", async (req, res) => { // loginpost POST isteği yapılınca çalışacak yer
    const email = req.query.email; // email parametresini al
    const password = req.query.password; // password parametresini al
    const passHash2Hash = crypto.createHash('sha256').update(password).digest('hex'); // passwordu sha256 ile şifrele
    const passHash2 = crypto.createHash('sha256').update(passHash2Hash).digest('hex'); // passwordu 2. kez sha256 ile şifrele

    const loginQuery = "SELECT * FROM users WHERE email = ? AND password = ?"; // kullanıcıyı veritabanında arayacak sorgu
    con.query(loginQuery, [email, passHash2], function (err, result) { // sorguyu çalıştırma
        if (err) { // hata varmı kontrol et
            throw err;
        }
        if (result.length > 0) { // eğer kullanıcı bulunduysa

            // geri cevap gönderme bilgileri
            let json = {
                success: true, // başarılı
                message: 'Başarılı giriş.' // başarılı olduğunun mesajını gönder 

            };
            session.user = result; // kullanıcının bilgilerini oturum aç
            res.json(json); // geri cevap gönder
        } else {
            // geri cevap gönderme bilgileri

            let json = {
                success: false, // hata
                message: 'E-posta veya şifre hatalı.' // hatalı olduğunun mesajını gönder 
            };
            res.json(json); // geri cevap gönder
        }
    });

});
app.post("/registerpost", async (req, res) => { // /registerpost POST isteği gönderilince çalışacak yer
    const name = req.query.name; // name parametresini al
    const username = req.query.username; // username parametresini al
    const email = req.query.email; // email parametresini al
    const password = req.query.password; // password parametresini al
    const againpassword = req.query.againpassword; // tekrar password parametresini al
    if (name === "" || username === "" || email === "" || password === "" || againpassword === "") { // parametrelerden herhangi biri boş mu diye kontrol et
        let json = {
            success: false, // hatalı
            message: 'Boş bıraktığınız kısımlar var.' // hata mesajı
        };
        return res.json(json); // return ile işlemi sonlandır ve geri cevap gönder
    }
    if (!email.includes("@")) { // email parametresi @ içeriyor mu kontrol et
        let json = {
            success: false, // hatalı
            message: 'Geçerli bir e-posta adresi giriniz.' // hata mesajı
        };
        return res.json(json); // return ile işlemi sonlandır ve geri cevap gönder

    }
    if (password.length < 8) { // password parametresi 8 den küçük mü diye kontrol et
        let json = {
            success: false, // hatalı
            message: 'Parola uzunluğu 8 veya 8 den fazla olmalıdır.' // hata mesajı
        };
        return res.json(json); // return ile işlemi sonlandır ve geri cevap gönder
    }
    if (againpassword != password) { // password parametresi ile tekrar password parametresi aynı mı kontrol et
        let json = {
            success: false, // hatalı
            message: 'Şifreler uyuşmuyor.' // hata mesajı
        };
        return res.json(json); // return ile işlemi sonlandır ve geri cevap gönder
    }

    const passHash2Hash = crypto.createHash('sha256').update(password).digest('hex'); // password parametresini sha256 ile şifrele
    const passHash2 = crypto.createHash('sha256').update(passHash2Hash).digest('hex'); // password parametresini sha256 ile 2. kez şifrele
    const date = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }); // tarih saat bilgisi almak için

    const emailCheckQuery = "SELECT * FROM users WHERE email = ?"; // e-posta zaten var mı kontrol sorgusu
    con.query(emailCheckQuery, [email], function (err, result) { // e-posta kontrol sorgusunu çalıştır
        if (err) { // hata var mı kontrol et
            throw err;
        }
        if (result.length > 0) { // eğer e-posta veritabanında bulunduysa
            let json = {
                success: false, // hata
                message: 'Bu e-posta adresi zaten kullanılıyor.' // hata mesajı
            };
            res.json(json); // geri cevap gönder
        } else {
            const insertQuery = "INSERT INTO users (name, username, email, password, createdate) VALUES (?, ?, ?, ?, ?)"; // veritabanına ekleme sorgusu
            con.query(insertQuery, [name, username, email, passHash2, date], function (err, result) { // sorguyu çalıştır
                if (err) { // hata kontrol
                    throw err;
                }
                let json = {
                    success: true, // başarılı
                    message: 'Kayıt başarılı.' // başarılı mesajı
                };
                res.json(json); // geri cevap gönder
            });
        }
    });

});

/* CHAT */
app.get("/", async (req, res) => {
    if (session.user) {       // kullanıcının oturumunu kontrol eder 

        res.redirect("/chat");
    }
    else { // oturumu yoksa login.html'e yönlendir.
        res.redirect("../login.html");
    }
});

app.get("/chat", async (req, res) => { // siteye girdiğinde ilk çalışacak yer
    if (session.user) {       // kullanıcının oturumunu kontrol eder 

        res.sendFile(public + "chat.html");
    }
    else { // oturumu yoksa login.html'e yönlendir.
        res.redirect("../login.html");
    }
});

// İstemci bağlandığında
io.on('connection', (socket) => {
    if (!session.user) {
        socket.emit('redirect', '../login'); // "/login" istemciyi yönlendirmek istediğiniz sayfanın adresi

    }
    console.log('Yeni bir istemci bağlandı.');

    con.query('SELECT sender, message, date FROM messages', (err, results) => {
        if (err) {
            console.error('Mesajları çekerken bir hata oluştu: ' + err.message);
        } else {
            // Her bir sonuç nesnesinden "sender" ve "message" alanlarını alın
            const messages = results.map(result => {
                return {
                    sender: result.sender,
                    message: result.message,
                    date: result.date,
                };
            });
            socket.emit('messages', messages);
        }
    });

    socket.on('newMessage', message => {

        // Yeni bir mesaj geldiğinde, MySQL veritabanına kaydedin ve diğer istemcilere iletilsin
        const nowdate = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }); // tarih saat bilgisi almak için

        con.query('INSERT INTO messages (message, sender, date) VALUES (?, ?, ?)', [message.content, session.user[0].username, nowdate], (err, result) => {
            if (err) {
                console.error('Mesajı veritabanına kaydederken bir hata oluştu: ' + err.message);
            } else {
                // İstemcilere yeni mesajı ileterek gerçek zamanlı güncellemeyi sağlayın
                io.emit('newMessage', { id: result.insertId, content: message.content, sender: session.user[0].username, date: nowdate });
            }
        });
    });
});

/* PROFİLE */

app.get("/profile", async (req, res) => {
    res.sendFile(public3+"profile.html");
})