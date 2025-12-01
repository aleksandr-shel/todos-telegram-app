from aiogram import Dispatcher, Bot
from aiogram.types import Message
from aiogram.filters import Command

import asyncio

from dotenv import load_dotenv
from os import getenv

load_dotenv()

BOT_TOKEN = getenv("TELEGRAM_TOKEN")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(Command('start'))
async def startCommand(message:Message):
    id = str(message.from_user.id)
    await message.answer(id)

async def main():
    await dp.start_polling(bot)

if __name__=="__main__":
    asyncio.run(main())