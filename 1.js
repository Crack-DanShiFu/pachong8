const askcKVZFtAaX = "aSSzw4qSw3CpibeH";
const asineMWcGMV9 = "brUOVaMKOo7l664s";
const ackhjMJP86fU = "dzU8iczFMWzO3KnG";
const aciQccLMSEkH = "fOGEShAJfDHfkgDh";
const dskM2Jfsvegc = "hcF3Qrl52bruWp4X";
const dsippkbZFmnO = "xzAuj2mqiL9Plhr7";
const dckbiCN2hSWj = "ooe4MOimAt3ZZdWo";
const dcinBuPDRDZU = "p70ihpRw6Mer0Trw";
const aes_local_key = 'emhlbnFpcGFsbWtleQ==';
const aes_local_iv = 'emhlbnFpcGFsbWl2';
var BASE64 = {
    encrypt: function (text) {
        var b = new Base64();
        return b.encode(text)
    },
    decrypt: function (text) {
        var b = new Base64();
        return b.decode(text)
    }
};
var DES = {
    encrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(0, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(24, 8);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.DES.encrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString()
    },
    decrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(0, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(24, 8);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.DES.decrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString(CryptoJS.enc.Utf8)
    }
};
var AES = {
    encrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(16, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(0, 16);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.AES.encrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString()
    },
    decrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(16, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(0, 16);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.AES.decrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString(CryptoJS.enc.Utf8)
    }
};
var localStorageUtil = {
    save: function (name, value) {
        var text = JSON.stringify(value);
        text = BASE64.encrypt(text);
        text = AES.encrypt(text, aes_local_key, aes_local_iv);
        try {
            localStorage.setItem(name, text)
        } catch (oException) {
            if (oException.name === 'QuotaExceededError') {
                console.log('超出本地存储限额！');
                localStorage.clear();
                localStorage.setItem(name, text)
            }
        }
    },
    check: function (name) {
        return localStorage.getItem(name)
    },
    getValue: function (name) {
        var text = localStorage.getItem(name);
        var result = null;
        if (text) {
            text = AES.decrypt(text, aes_local_key, aes_local_iv);
            text = BASE64.decrypt(text);
            result = JSON.parse(text)
        }
        return result
    },
    remove: function (name) {
        localStorage.removeItem(name)
    }
};

function getDataFromLocalStorage(key, period) {
    if (typeof period === 'undefined') {
        period = 0
    }
    var d = DES.encrypt(key);
    d = BASE64.encrypt(key);
    var data = localStorageUtil.getValue(key);
    if (data) {
        const time = data.time;
        const current = new Date().getTime();
        if (new Date().getHours() >= 0 && new Date().getHours() < 5 && period > 1) {
            period = 1
        }
        if (current - (period * 60 * 60 * 1000) > time) {
            data = null
        }
        if (new Date().getHours() >= 5 && new Date(time).getDate() !== new Date().getDate() && period === 24) {
            data = null
        }
    }
    return data
}
function ObjectSort(obj) {
    var newObject = {};
    Object.keys(obj).sort().map(function (key) {
        newObject[key] = obj[key]
    });
    return newObject
}
function d69QQ1HKhYSaB(data) {
    data = BASE64.decrypt(data);
    data = DES.decrypt(data, dskM2Jfsvegc, dsippkbZFmnO);
    data = AES.decrypt(data, askcKVZFtAaX, asineMWcGMV9);
    data = BASE64.decrypt(data);
    return data
}
var pcYYnunYlRv7kSTY = (function () {
    function ObjectSort(obj) {
        var newObject = {};
        Object.keys(obj).sort().map(function (key) {
            newObject[key] = obj[key]
        });
        return newObject
    }
    return function (method, obj) {
        var appId = 'c26f2b68236cdd69bcee93bce49dda5f';
        var clienttype = 'WEB';
        var timestamp = new Date().getTime();
        var param = {
            appId: appId,
            method: method,
            timestamp: timestamp,
            clienttype: clienttype,
            object: obj,
            secret: hex_md5(appId + method + timestamp + clienttype + JSON.stringify(ObjectSort(obj)))
        };
        param = BASE64.encrypt(JSON.stringify(param));
        param = AES.encrypt(param, ackhjMJP86fU, aciQccLMSEkH);
        return param
    }
})();

function sUVLzCSXGkeEO16(method, object, callback, period) {
    const key = hex_md5(method + JSON.stringify(object));
    const data = getDataFromLocalStorage(key, period);
    if (!data) {
        var param = pcYYnunYlRv7kSTY(method, object);
        $.ajax({
            url: 'api/historyapi.php',
            data: {
                hPhsqVHRI: param
            },
            type: "post",
            success: function (data) {
                data = d69QQ1HKhYSaB(data);
                obj = JSON.parse(data);
                if (obj.success) {
                    if (period > 0) {
                        obj.result.time = new Date().getTime();
                        localStorageUtil.save(key, obj.result)
                    }
                    callback(obj.result)
                } else {
                    console.log(obj.errcode, obj.errmsg)
                }
            }
        })
    } else {
        callback(data)
    }
}