from aiogram import Dispatcher, Bot
from aiogram.types import Message
from aiogram.filters import Command
from aiogram.enums import ParseMode
import asyncio

from dotenv import load_dotenv
from os import getenv

import json 

load_dotenv()

BOT_TOKEN = getenv("TELEGRAM_TOKEN")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(Command('start'))
async def startCommand(message:Message):
    
    message_dict = message.model_dump(mode="json")
    filename = f"message_{message.message_id}.json"
    try:
        with open(filename, 'w') as f:
            json.dump(message_dict, f, ensure_ascii=False, indent=4)
        await message.answer(f"Message successfully saved to <code>{filename}</code>", parse_mode=ParseMode.HTML)

    except IOError as e:
        await message.answer(f"error: {e}")
    # id = str(message.from_user.id)
    # await message.answer(id)

async def main():
    await dp.start_polling(bot)

if __name__=="__main__":
    asyncio.run(main())