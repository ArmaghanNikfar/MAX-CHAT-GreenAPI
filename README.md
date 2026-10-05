# MAX Chat

Простой веб-чат на React для отправки и получения **текстовых** сообщений в мессенджере MAX через сервис [GREEN-API](https://green-api.com/max). Внешний вид выполнен по мотивам [web.max.ru](https://web.max.ru/).

**Демо:** https://ArmaghanNikfar.github.io/<название-репозитория>/


- Вход по `idInstance` и `apiTokenInstance` (данные проверяются методом `getStateInstance`)
- Создание чата по номеру телефона получателя
- Отправка сообщений: [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/)
- Получение сообщений через HTTP API: [ReceiveNotification](https://green-api.com/v3/docs/api/receiving/technology-http-api/ReceiveNotification/) и [DeleteNotification](https://green-api.com/v3/docs/api/receiving/technology-http-api/DeleteNotification/)
- История чатов сохраняется в `localStorage` браузера
- Светлая и тёмная тема, адаптивная вёрстка

## Технологии

React 18, Vite, чистый CSS. Без сторонних UI-библиотек.

## Перед запуском: настройка инстанса GREEN-API

1. Создайте инстанс MAX в [личном кабинете](https://console.green-api.com) и авторизуйте его через QR-код в приложении MAX.
2. Откройте настройки инстанса (кнопка «Изменить») и включите **«Получать уведомления о входящих сообщениях и файлах»**.
3. Оставьте поле **Webhook URL пустым**: так уведомления будут приходить через HTTP API.
4. Сохраните изменения и дождитесь, пока инстанс снова получит статус `authorized`.

## Локальный запуск

Требуется Node.js 18 или новее.

```bash
git clone https://github.com/ArmaghanNikfar/<название-репозитория>.git
cd <название-репозитория>
npm install
npm run dev
```

Откройте http://localhost:5173.

Другие команды:

```bash
npm run build     
npm run preview   
```

## Как пользоваться

1. Введите `idInstance` и `apiTokenInstance`. Поле `apiUrl` по умолчанию `https://api.green-api.com`; если в кабинете указан другой адрес, замените его.
2. Введите номер получателя в международном формате без `+` (например, `79991234567`) и нажмите «Создать чат».
3. Напишите сообщение и отправьте его (Enter, для переноса строки Shift+Enter).
4. Ответ получателя появится в этом же чате. Зелёный индикатор рядом с заголовком «Чаты» означает, что связь с GREEN-API работает.

## Структура проекта

```
src/
  api.js                 запросы к GREEN-API
  App.jsx                состояние, получение уведомлений, отправка
  components/
    Login.jsx            форма входа
    Sidebar.jsx          список чатов и создание нового чата
    ChatWindow.jsx       переписка и поле ввода
  styles.css
```

## Как работает получение сообщений

Приложение в цикле вызывает `ReceiveNotification` (long polling, таймаут 5 секунд). Для каждого уведомления с типом `incomingMessageReceived` и текстовым содержимым сообщение добавляется в нужный чат, после чего вызывается `DeleteNotification`, чтобы подтвердить обработку. Уведомления других типов пропускаются и также удаляются из очереди.

## Деплой на GitHub Pages

В репозитории есть workflow `.github/workflows/deploy.yml`. Чтобы включить публикацию:

1. Откройте Settings → Pages и выберите Source: **GitHub Actions**.
2. Сделайте push в `main` или `master`.
3. Адрес сайта появится в разделе Pages после успешного завершения workflow.

## Возможные проблемы

| Проблема | Решение |
| --- | --- |
| Не удаётся войти | Проверьте `idInstance`, `apiTokenInstance` и статус инстанса (должен быть `authorized`) |
| Сообщения отправляются, но ответы не приходят | Проверьте, что включены уведомления о входящих сообщениях и что Webhook URL пуст |
| Красный индикатор рядом с «Чаты» | Нет связи с GREEN-API; откройте консоль браузера и посмотрите код ошибки запроса `receiveNotification` |
| Белый экран на GitHub Pages | В Settings → Pages должен быть выбран Source: GitHub Actions |

## Безопасность

Токен хранится только в `localStorage` вашего браузера и отправляется исключительно на адрес `apiUrl` (GREEN-API).
