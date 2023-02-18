# UMEE LIQUIDATION BOT

## Overview

This UMEE bot takes advantage of times when a user cant pay their debts because there collateral value no longer covers there loan
value.
thus the bot ends up paying their debts for them while also claiming there collateral and a reward given by UMEE

# Setup

for a more in depth explaination(s) please read [here](https://github.com/kwak-labs/umee-liquidation-bot/tree/master/docs)

1. `git clone https://github.com/kwak-labs/umee-liquidation-bot.git`
2. `cd umee-liqudation-bot`
3. open config/config.json and edit data to your liking, however presets are also a good option.
4. `npm i` to install all the needed packages
5. `node src/index.js` to start the bot

# To-Do

- The bot currently assumes you have enough assets to pay off someones debts, and will not borrow to pay it.
- Make the bot load prices into memory every so often, rather than querying the price every new liquidation. Can help with speed when liquidating someone and, rate limits.
