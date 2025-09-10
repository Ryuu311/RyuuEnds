// FUNGSI MENGEKSTRAK MODULE
require("./settings");
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, delay, Browsers, makeCacheableSignalKeyStore, jidDecode } = require('@whiskeysockets/baileys');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const { modul } = require("./module");
const cfonts = require('cfonts');
const moment = require("moment-timezone");
const figlet = require("figlet");
const gradient = require("gradient-string");
const { baileys, boom, chalk, fs, FileType, path, pino, PhoneNumber, axios, } = modul;
const { Boom } = boom
const { makeInMemoryStore } = require("./lib/store/");
const { tanggal, day, bulan, tahun, weton } = require("./lib/myfunc");
const { color, bgcolor } = require("./lib/color");
const { uncache, nocache } = require("./lib/loader");
const { handleIncomingMessage } = require("./lib/user");
const Pino = require("pino");
const readline = require("readline");
const yargs = require('yargs/yargs')
const _ = require('lodash')
const NodeCache = require("node-cache");
let db = JSON.parse(fs.readFileSync('./database/welcome.json'));

// FUNGSI UBTUK MENGEKSTRAK FILR
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep, reSize, } = require("./lib/myfunc");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid, addExif } = require('./lib/exif')
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);
const prefix = "";
const type = (x) => x?.constructor?.name || (x === null ? "null" : "undefined");
const isStringSame = (x, y) => (Array.isArray(y) ? y.includes(x) : y === x);
const buttonTypes = [];
const customCode = 'RYUUHIRU'

// FUNGSI UNTUK MENGEKSTRAK DATABASE
var low
try {
low = require('lowdb')
} catch (e) {
low = require('./lib/lowdb')}
const { Low, JSONFile } = low
const mongoDB = require('./lib/mongoDB')

const store = makeInMemoryStore({
  logger: pino().child({
    level: "silent",
    stream: "store",
  }),
});

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(
/https?:\/\//.test(opts['db'] || '') ?
new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
new mongoDB(opts['db']) :
new JSONFile(`./database/database.json`)
)
global.DATABASE = global.db // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))
if (global.db.data !== null) return
global.db.READ = true
await global.db.read()
global.db.READ = false
global.db.data = {
users: {},
chats: {},
game: {},
database: {},
settings: {},
setting: {},
others: {},
sticker: {},
...(global.db.data || {})}
  global.db.chain = _.chain(global.db.data)}
loadDatabase()

let phoneNumber = `${nomorbot}`;
const pairingCode = false;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, resolve)
    })
};


// FUNGSI MEMULAI MENJALANKAN BOT
async function startsesi() {
  const { saveCreds, state } = await useMultiFileAuthState(`./session`);
  const msgRetryCounterCache = new NodeCache();
  const syncKeys = async () => {
    try {
      await saveCreds(state.creds);
    } catch (err) {
      console.error("Key synchronization failed:", err);
    }
  };
  const RyuuBotz = makeWASocket({
        logger: pino({
            level: "silent"
    }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Safari"),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "silent" })),
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);
      return msg?.message || "";
    },
    msgRetryCounterCache,
  });
  global.Client = RyuuBotz
  syncKeys();
  if (store) {
    store.bind(RyuuBotz.ev);
  }
  RyuuBotz.ev.on("creds.update", saveCreds);
  if (!RyuuBotz.authState.creds.registered) {
  /*await delay(5000);*/
    console.log("Making pairing code.....");
    const number = phoneNumber;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(6000);
    const code = await RyuuBotz.requestPairingCode(number, customCode);
    console.log(
      chalk.black(chalk.bgGreen(`Your Pairing : `)),
      chalk.black(chalk.white(code)),
    );
  }

// FUNGSI CONNECTION  
  RyuuBotz.ev.on('connection.update', async (update) => {
	const {
		connection,
		lastDisconnect
	} = update
try{
		if (connection === 'close') {
			let reason = new Boom(lastDisconnect?.error)?.output.statusCode
			if (reason === DisconnectReason.badSession) {
				console.log(`Bad Session File, Please Delete Session and Connect Again`);
				startsesi()
			} else if (reason === DisconnectReason.connectionClosed) {
				console.log("Connection closed, reconnecting....");
				startsesi();
			} else if (reason === DisconnectReason.connectionLost) {
				console.log("Connection Lost from Server, reconnecting...");
				startsesi();
			} else if (reason === DisconnectReason.connectionReplaced) {
				console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
				startsesi()
			} else if (reason === DisconnectReason.loggedOut) {
				console.log(`Device Logged Out, Please Connect Again And Run.`);
				startsesi();
			} else if (reason === DisconnectReason.restartRequired) {
				console.log("Restart Required, Restarting...");
				startsesi();
			} else if (reason === DisconnectReason.timedOut) {
				console.log("Connection TimedOut, Reconnecting...");
				startsesi();
			} else {
			  console.log(`Unknown DisconnectReason: ${reason}|${connection}`)
			  startsesi();
			}
		}
		if (update.connection == "connecting" || update.receivedPendingNotifications == "false") {
			console.log(color(`\nMenyambungkan...`, 'blue'))
		}
		if (update.connection == "open" || update.receivedPendingNotifications == "true") {
			await delay(1999)
cfonts.say('MAHIRU', {
    font: 'block',
    align: 'left',
    colors: ['#FFA500', 'redBright'],
    background: 'transparent',
    maxLength: 20,
    rawMode: false,
});

console.log(chalk.yellow(`Successfully connected to WhatsApp!!!`))
		}
} catch (err) {
	  console.log('Error in Connection.update '+err)
	  startsesi();
	}
	
});
  
  
  RyuuBotz.ev.on("messages.upsert", async (chatUpdate) => {
  try {
    const kay = chatUpdate.messages[0];
    if (!kay.message) return;

    // Ekstrak isi pesan (jika ephemeral)
    kay.message =
      Object.keys(kay.message)[0] === "ephemeralMessage"
        ? kay.message.ephemeralMessage.message
        : kay.message;

    const m = smsg(RyuuBotz, kay, store);

// SKIP CHAT SALURAN
if (m.key.remoteJid && m.key.remoteJid.endsWith('@newsletter')) {
    return;
}

    // FUNGSI CEGAH PROSES CHAT DUPLIKAT
    if (kay.key.id.startsWith("BAE5") && kay.key.id.length === 16) return;

    // FUNGSI HANDLE MESSAGE 
    if (
      !m.key.fromMe &&
      m.key.remoteJid.endsWith("@s.whatsapp.net") &&
      m.text
    ) {
      handleIncomingMessage(RyuuBotz, m.key.remoteJid);
    }

    // HANDLE UTAMA
    require("./case")(RyuuBotz, m, chatUpdate, store);
  } catch (err) {
    console.error("Error saat memproses pesan:", err);
     if (global.channel_log === true) {   
    let message___ = `Error saat memproses pesan: ${err}`;
  RyuuBotz.sendMessage('120363420007790159@newsletter', {
    text: message___,
    contextInfo: {
      externalAdReply: {
        title: 'Log Bot ERROR!!',
        body: `Error detected!`,
        thumbnailUrl: global.thumbnail,
        sourceUrl: global.saluran,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  });
 }
  }
});
  RyuuBotz.ev.on("messages.update", async (chatUpdate) => {
    for (const { key, update } of chatUpdate) {
      if (update.pollUpdates && key.fromMe) {
        const pollCreation = await getMessage(key);
        if (pollCreation) {
          const pollUpdate = await getAggregateVotesInPollMessage({
            message: pollCreation,
            pollUpdates: update.pollUpdates,
          });
          var toCmd = pollUpdate.filter((v) => v.voters.length !== 0)[0]?.name;
          if (toCmd == undefined) return;
          var prefCmd = prefix + toCmd;
          RyuuBotz.appenTextMessage(prefCmd, chatUpdate);
        }
      }
    }
  });
  RyuuBotz.ev.on('group-participants.update', async (anu) => {
  let { id, participants, action } = anu;
  if (!db.groups) db.groups = {};
  if (!db.groups[id]) db.groups[id] = { welcome: false, goodbye: false };

  try {
    const groupMetadata = await RyuuBotz.groupMetadata(id);
    const groupName = groupMetadata.subject || "Grup ini";

    for (let num of participants) {
      let userTag = '@' + num.split('@')[0];
      let ppUrl;
      try {
        ppUrl = await RyuuBotz.profilePictureUrl(num, 'image');
      } catch {
        ppUrl = 'https://telegra.ph/file/265c672094dfa87caea19.jpg'; // default
      }
      let bgUrl = global.thumbnail;      
      let _nama__ = RyuuBotz.getName(num)

      if (action === 'add' && db.groups[id].welcome) {
      console.log('member Update (add)');
        // welcome teks
        let teks = (db.groups[id].welcomeText || `Selamat datang ${_nama__} di grup ${groupName}!`)
          .replace(/@user/gi, userTag)
          .replace(/@group/gi, groupName);
          
        let text = (`Selamat datang ${_nama__} di grup ${groupName}!`)

        // api url
        let Bufer = `https://api.ryuu-dev.offc.my.id/tools/WelcomeLeave?desc=${encodeURIComponent(text)}&title=Welcome!!&profile=${encodeURIComponent(ppUrl)}&background=${encodeURIComponent(bgUrl)}`;
        const buffer = (await axios.get(Bufer, { responseType: 'arraybuffer' })).data;

        await RyuuBotz.sendMessage(id, {
      text: teks,
      mentions: [num],
      contextInfo: {
        externalAdReply: {
          title: `Welcome ${_nama__}!`,
          body: text,
          mediaType: 1,
          previewType: "PHOTO",
          thumbnail: buffer,
          sourceUrl: "https://api.ryuu-dev.offc.my.id",
          renderLargerThumbnail: true
        },
      },
    });

      } else if (action === 'remove' && db.groups[id].goodbye) {
      console.log('member Update (remove)');
        // goodbye teks
        let text = (db.groups[id].goodbyeText || `Selamat tinggal ${_nama__}, semoga betah di luar ${groupName} 👋`)
          .replace(/@user/gi, userTag)
          .replace(/@group/gi, groupName);
          
        let teks = (`Selamat tinggal ${_nama__}, semoga betah di luar ${groupName} 👋`)

        // api url
        let Bufer = `https://api.ryuu-dev.offc.my.id/tools/WelcomeLeave?desc=${encodeURIComponent(teks)}&title=Good%20Bye&profile=${encodeURIComponent(ppUrl)}&background=${encodeURIComponent(bgUrl)}`;      
        const buffer = (await axios.get(Bufer, { responseType: 'arraybuffer' })).data;

        await RyuuBotz.sendMessage(id, {
      text: text,
      mentions: [num],
      contextInfo: {
        externalAdReply: {
          title: `Good bye ${_nama__}!`,
          body: teks,
          mediaType: 1,
          previewType: "PHOTO",
          thumbnail: buffer,
          sourceUrl: "https://api.ryuu-dev.offc.my.id",
          renderLargerThumbnail: true
        },
      },
    });
      }
    }
  } catch (e) {
    console.log("Welcome/Goodbye error:", e.message);
  }
});
  RyuuBotz.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    RyuuBotz.sendMessage(
      jid,
      {
        text: text,
        contextInfo: {
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(
            (v) => v[1] + "@s.whatsapp.net",
          ),
        },
        ...options,
      },
      {
        quoted,
      },
    );
  RyuuBotz.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
    } else return jid;
  };
  RyuuBotz.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = RyuuBotz.decodeJid(contact.id);
      if (store && store.contacts)
        store.contacts[id] = {
          id,
          name: contact.notify,
        };
    }
  });
  RyuuBotz.getName = (jid, withoutContact = false) => {
    id = RyuuBotz.decodeJid(jid);
    withoutContact = RyuuBotz.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = RyuuBotz.groupMetadata(id) || {};
        resolve(
          v.name ||
            v.subject ||
            PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber(
              "international",
            ),
        );
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === RyuuBotz.decodeJid(RyuuBotz.user.id)
            ? RyuuBotz.user
            : store.contacts[id] || {};
    return (
      (withoutContact ? "" : v.name) ||
      v.subject ||
      v.verifiedName ||
      PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
        "international",
      )
    );
  };
  RyuuBotz.parseMention = (text = "") => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net",
    );
  };
  RyuuBotz.sendContact = async (jid, kon, quoted = "", opts = {}) => {
    let list = [];
    for (let i of kon) {
      list.push({
        displayName: await RyuuBotz.getName(i),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await RyuuBotz.getName(i)}\nFN:${await RyuuBotz.getName(i)}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${ytname}\nitem2.X-ABLabel:YouTube\nitem3.URL:${socialm}\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${location};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
      });
    }
    RyuuBotz.sendMessage(
      jid,
      {
        contacts: {
          displayName: `${list.length} Contact`,
          contacts: list,
        },
        ...opts,
      },
      {
        quoted,
      },
    );
  };
  RyuuBotz.setStatus = (status) => {
    RyuuBotz.query({
      tag: "iq",
      attrs: {
        to: "@s.whatsapp.net",
        type: "set",
        xmlns: "status",
      },
      content: [
        {
          tag: "status",
          attrs: {},
          content: Buffer.from(status, "utf-8"),
        },
      ],
    });
    return status;
  };

  RyuuBotz.sendImage = async (jid, path, caption = "", quoted = "", options) => {
    let buffer = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
            ? fs.readFileSync(path)
            : Buffer.alloc(0);
    return await RyuuBotz.sendMessage(
      jid,
      {
        image: buffer,
        caption: caption,
        ...options,
      },
      {
        quoted,
      },
    );
  };
  RyuuBotz.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
            ? fs.readFileSync(path)
            : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    await RyuuBotz.sendMessage(
      jid,
      {
        sticker: {
          url: buffer,
        },
        ...options,
      },
      {
        quoted,
      },
    ).then((response) => {
      fs.unlinkSync(buffer);
      return response;
    });
  };
  RyuuBotz.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
            ? fs.readFileSync(path)
            : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }
    await RyuuBotz.sendMessage(
      jid,
      {
        sticker: {
          url: buffer,
        },
        ...options,
      },
      {
        quoted,
      },
    );
    return buffer;
  };
  RyuuBotz.sendImageAsStickerAvatar = async (
    jid,
    path,
    quoted,
    options = {},
  ) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
            ? fs.readFileSync(path)
            : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImgAvatar(buff, options);
    } else {
      buffer = await imageToWebpAvatar(buff);
    }
    await RyuuBotz.sendMessage(
      jid,
      {
        sticker: {
          url: buffer,
        },
        ...options,
      },
      {
        quoted,
      },
    ).then((response) => {
      fs.unlinkSync(buffer);
      return response;
    });
  };
  RyuuBotz.sendVideoAsStickerAvatar = async (
    jid,
    path,
    quoted,
    options = {},
  ) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
            ? fs.readFileSync(path)
            : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVidAvatar(buff, options);
    } else {
      buffer = await videoToWebpAvatar(buff);
    }
    await RyuuBotz.sendMessage(
      jid,
      {
        sticker: {
          url: buffer,
        },
        ...options,
      },
      {
        quoted,
      },
    );
    return buffer;
  };
  RyuuBotz.copyNForward = async (
    jid,
    message,
    forceForward = false,
    options = {},
  ) => {
    let vtype;
    if (options.readViewOnce) {
      message.message =
        message.message &&
        message.message.ephemeralMessage &&
        message.message.ephemeralMessage.message
          ? message.message.ephemeralMessage.message
          : message.message || undefined;
      vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete (message.message && message.message.ignore
        ? message.message.ignore
        : message.message || undefined);
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = {
        ...message.message.viewOnceMessage.message,
      };
    }
    let mtype = Object.keys(message.message)[0];
    let content = await generateForwardMessageContent(message, forceForward);
    let ctype = Object.keys(content)[0];
    let context = {};
    if (mtype != "conversation") context = message.message[mtype].contextInfo;
    content[ctype].contextInfo = {
      ...context,
      ...content[ctype].contextInfo,
    };
    const waMessage = await generateWAMessageFromContent(
      jid,
      content,
      options
        ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo
              ? {
                  contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo,
                  },
                }
              : {}),
          }
        : {},
    );
    await RyuuBotz.relayMessage(jid, waMessage.message, {
      messageId: waMessage.key.id,
    });
    return waMessage;
  };
  RyuuBotz.downloadAndSaveMediaMessage = async (
    message,
    filename,
    attachExtension = true,
  ) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    let trueFileName;
    if (type.ext == "ogg" || type.ext == "opus") {
      trueFileName = attachExtension ? filename + ".mp3" : filename;
      await fs.writeFileSync(trueFileName, buffer);
    } else {
      trueFileName = attachExtension ? filename + "." + type.ext : filename;
      await fs.writeFileSync(trueFileName, buffer);
    }
    return trueFileName;
  };
  RyuuBotz.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };
  RyuuBotz.getFile = async (PATH, save) => {
    let res;
    let filename;
    let data = Buffer.isBuffer(PATH)
      ? PATH
      : /^data:.*?\/.*?;base64,/i.test(PATH)
        ? Buffer.from(PATH.split`,`[1], "base64")
        : /^https?:\/\//.test(PATH)
          ? await (res = await getBuffer(PATH))
          : fs.existsSync(PATH)
            ? ((filename = PATH), fs.readFileSync(PATH))
            : typeof PATH === "string"
              ? PATH
              : Buffer.alloc(0);
    let type = (await FileType.fromBuffer(data)) || {
      mime: "application/octet-stream",
      ext: ".bin",
    };
    if (data && save) fs.promises.writeFile(filename, data);
    return {
      res,
      filename,
      size: await getSizeMedia(data),
      ...type,
      data,
    };
  };
  RyuuBotz.sendText = (jid, text, quoted = "", options) =>
    RyuuBotz.sendMessage(
      jid,
      {
        text: text,
        ...options,
      },
      {
        quoted,
      },
    );
  RyuuBotz.serializeM = (m) => smsg(RyuuBotz, m, store);
  /**
   * Send Media/File with Automatic Type Specifier
   * @param {String} jid
   * @param {String|Buffer} path
   * @param {String} filename
   * @param {String} caption
   * @param {import('@whiskeysockets/baileys').proto.WebMessageInfo} quoted
   * @param {Boolean} ptt
   * @param {Object} options
   */
  RyuuBotz.sendFile = async (
    jid,
    path,
    filename = "",
    caption = "",
    quoted,
    ptt = false,
    options = {},
  ) => {
    let type = await RyuuBotz.getFile(path, true);
    let { res, data: file, filename: pathFile } = type;
    if ((res && res.status !== 200) || file.length <= 65536) {
      try {
        throw {
          json: JSON.parse(file.toString()),
        };
      } catch (e) {
        if (e.json) throw e.json;
      }
    }
    const fileSize = fs.statSync(pathFile).size / 1024 / 1024;
    if (fileSize >= 1800) throw new Error(" The file size is too large\n\n");
    let opt = {};
    if (quoted) opt.quoted = quoted;
    if (!type) options.asDocument = true;
    let mtype = "",
      mimetype = options.mimetype || type.mime,
      convert;
    if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
  else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
  else if (/video/.test(type.mime)) mtype = 'video';
  else if (/audio/.test(type.mime)) {
    convert = await (ptt ? toPTT : toAudio)(file, type.ext);
    file = convert.data;
    pathFile = convert.filename;
    mtype = 'audio';
    mimetype = 'audio/ogg; codecs=opus';
  } else mtype = 'document';
    if (options.asDocument) mtype = "document";
    delete options.asSticker;
    delete options.asLocation;
    delete options.asVideo;
    delete options.asDocument;
    delete options.asImage;
    let message = {
      ...options,
      caption,
      ptt,
      [mtype]: {
        url: pathFile,
      },
      mimetype,
      fileName: filename || pathFile.split("/").pop(),
    };
    /**
     * @type {import('@whiskeysockets/baileys').proto.WebMessageInfo}
     */
    let m;
    try {
      m = await RyuuBotz.sendMessage(jid, message, {
        ...opt,
        ...options,
      });
    } catch (e) {
      console.error(e);
      m = null;
    } finally {
      if (!m)
        m = await RyuuBotz.sendMessage(
          jid,
          {
            ...message,
            [mtype]: file,
          },
          {
            ...opt,
            ...options,
          },
        );
      file = null; // releasing the memory
      return m;
    }
  };
  RyuuBotz.sendFile = async (jid, media, options = {}) => {
    let file = await RyuuBotz.getFile(media);
    let mime = file.ext,
      type;
    // Tentukan tipe file berdasarkan ekstensi
    if (mime == "mp3") {
      type = "audio";
      options.mimetype = "audio/mpeg";
      options.ptt = options.ptt || false;
    } else if (mime == "jpg" || mime == "jpeg" || mime == "png") {
      type = "image";
    } else if (mime == "webp") {
      type = "sticker";
    } else if (mime == "mp4") {
      type = "video";
    } else {
      type = "document";
    }
    // Menambahkan caption dan quoted ke pengiriman pesan
    return RyuuBotz.sendMessage(
      jid,
      {
        [type]: file.data,
        caption: options.caption || "", // Menambahkan caption jika ada
        ...options,
      },
      {
        quoted: options.quoted || "", // Menambahkan quoted jika ada
        ...options,
      },
    );
  };
  RyuuBotz.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
    let mime = "";
    let res = await axios.head(url);
    mime = res.headers["content-type"];
    if (mime.split("/")[1] === "gif") {
      return RyuuBotz.sendMessage(
        jid,
        {
          video: await getBuffer(url),
          caption: caption,
          gifPlayback: true,
          ...options,
        },
        {
          quoted: quoted,
          ...options,
        },
      );
    }
    let type = mime.split("/")[0] + "Message";
    if (mime === "application/pdf") {
      return RyuuBotz.sendMessage(
        jid,
        {
          document: await getBuffer(url),
          mimetype: "application/pdf",
          caption: caption,
          ...options,
        },
        {
          quoted: quoted,
          ...options,
        },
      );
    }
    if (mime.split("/")[0] === "image") {
      return RyuuBotz.sendMessage(
        jid,
        {
          image: await getBuffer(url),
          caption: caption,
          ...options,
        },
        {
          quoted: quoted,
          ...options,
        },
      );
    }
    if (mime.split("/")[0] === "video") {
      return RyuuBotz.sendMessage(
        jid,
        {
          video: await getBuffer(url),
          caption: caption,
          mimetype: "video/mp4",
          ...options,
        },
        {
          quoted: quoted,
          ...options,
        },
      );
    }
    if (mime.split("/")[0] === "audio") {
      return RyuuBotz.sendMessage(
        jid,
        {
          audio: await getBuffer(url),
          caption: caption,
          mimetype: "audio/mpeg",
          ...options,
        },
        {
          quoted: quoted,
          ...options,
        },
      );
    }
  };
  /**
   *
   * @param {*} jid
   * @param {*} name
   * @param [*] values
   * @returns
   */
  /*
  RyuuBotz.sendPoll = (jid, name = "", values = [], selectableCount = 1) => {
    return RyuuBotz.sendMessage(jid, {
      poll: {
        name,
        values,
        selectableCount,
      },
    });
  };
  */
  /**
   * @typedef Media
   * @prop {"image"|"video"|"document"} type
   * @prop {buffer|{ url: string }} data
   * @prop {{}} [options]
   */
  /**
   * @typedef Button
   * @prop {Section[]} [sections]
   */
  /**
   * @typedef Section
   * @prop {string} title
   * @prop {Row[]} rows
   */
  /**
   * @typedef Row
   * @prop {string} header
   * @prop {string} title
   * @prop {string} description
   * @prop {string} id
   */
  /**
   * Function to send interactiveMessage
   *
   * @param {string} jid
   * @param {string} body
   * @param {string} [footer]
   * @param {string} title
   * @param {string} [subtitle]
   * @param {Media} [media]
   * @param {Button[]} buttons
   * @param {proto.WebMessageInfo} [quoted]
   * @param {{}} [options={}]
   * @returns {Promise<proto.WebMessageInfo>}
   */
 
    // ### End of sending message ###
  return RyuuBotz;
}
startsesi();

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})