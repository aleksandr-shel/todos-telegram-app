from aiogram import Dispatcher, Bot
from aiogram.types import Message
from aiogram.filters import Command
from aiogram.enums import ParseMode
import asyncio
import requests

from dotenv import load_dotenv
from os import getenv

import json 

load_dotenv()

BOT_TOKEN = getenv("TELEGRAM_TOKEN")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(Command('start'))
async def startCommand(message:Message):
    
    full_text = message.text
    parts = full_text.split()
    if len(parts)>1 and parts[1].startswith("connect_"):
        user_id = parts[1].replace("connect_","")
        telegram_id = message.from_user.id

        res = requests.post(
            'http://localhost:8000/api/telegram/link',
            json={
                "user_id":user_id,
                "telegram_id":telegram_id
            }
        )
        data = res.json()

        await message.answer(data['details'])


@dp.message()
async def handleMessage(message: Message):
    await message.answer(f"Ты отправил: {message.text}")



async def main():
    await dp.start_polling(bot)

if __name__=="__main__":
    asyncio.run(main())