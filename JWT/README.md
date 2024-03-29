﻿# Регистрация, подтверждение аккаунта, авторизация, права

## Запуск
> Запустить сервер - cd server npm run dev  
> Запустить приложение - cd ../client npm install npm start

## Зависимости

Сервер:
> ![dep-server](https://i.ibb.co/Hx7wyYP/dep-server.jpg)

 Приложение:
> ![enter image description here](https://i.ibb.co/mDp74pm/dep-app.jpg)

## Основные технологии

 - [x] React
 - [x] Typescript
 - [x] Mobx
 - [x]  Node JS
 - [x] MongoDB
 - [x] JsonWebToken

## Попытка авторизации и получения данных
Что происходит, когда я запускаю приложение и сервер? Срабатывает useEffect(), задача которого проверить авторизован ли пользователь через проверку с localstorage. Пользователь не авторизован, поэтому сервер пробрасывает 401 ошибку (Bad Request).

![login-1](https://i.ibb.co/J398S23/login.jpg)

Я жму кнопку "Получить пользователей" и опять же вижу 401 ошибку (Bad Request) и сообщение о том, что я не авторизован. Для того, чтобы получить доступ к списку пользователей, я должен пройти регистрацию, подтверждать аккаунт для этого необязательно.

![loginusers](https://i.ibb.co/16LWx4F/loginusers.jpg)

Если я попытаюсь ввести случайные данные и попробую пройти авторизацию, то меня ожидает ошибка 400 (Bad Request) и сообщение: 

  

> Пользователь с таким email не найден.


## Регистрация

От вас требуется ввести свою почту, на которую придет письмо со ссылкой на активацию аккаунта, а также пароль. Установлены зависимости, задача которых провести минимальную проверку на валидность данных (синтаксис почты, длина пароля). Вводим данные и видим, что в консоли объект со статусом 200 (OK) и токенами в ключе data.

![enter image description here](https://i.ibb.co/2N7Lwvz/reg.jpg)

## Проверка почты

Письмо действительно пришло! Тело письма простое: здесь блочный элемент, заголовок и ссылка. Напоминаю, наша задача - реализовать функционал.

![enter image description here](https://i.ibb.co/g65T5cT/mail.jpg)

Если кликнуть по ссылке, то произойдет редирект на наше приложение. В консоли видем статус 200 (OK), статус авторизованного пользователя и сообщение о том, что учетная запись подтверждена (при обновлении страницы не должно быть undefined на месте email). Круто. Попробуем получить пользователей?

![enter image description here](https://i.ibb.co/74Dt6Fj/activation.jpg)

## Права доступа

Напоминаю, что у неавторизованного пользователя нет прав на просмотр зарегистрированных пользователей. Просмотреть список пользователей можно только после регистрации, активация аккаунта необязательна. Пробуем получить список - успешно.

![users-after-reg](https://i.ibb.co/VwLydqM/usersafterreg.jpg)

## Лоудер

Если информация будет долго загружаться - на ее месте будет лоудер. Очень полезная вещь, когда необходимо задержать внимание пользователя на экране или создать иллюзию быстрой загрузки. 

![loader](https://i.ibb.co/jDF11DR/loader.jpg)

## Токены

Необходимая вещь в разработке. Правильное название - JSON WEB TOKEN (JWT). Это обычная закодированная строка из 3-х частей: 

 1. Заголовок (alg и typ)
 2. Вшиваемые данные (email, password, isActivated)
 3. Сигнатура (secret)
 
 Ключевая часть - **сигнатура**. Обеспечивает конфиденциальность данных. Для получения сигнатуры требуется секретный ключ secret: "СЕКРЕТНАЯ_СТРОКА".  

Как это работает: берем заголовок и данные, а с помощью секретного ключа  все кодируем, и на выходе получаем сигнатуру.  Сигнатура нужна для того, чтобы *убедиться, что токен не был подделан*.

## Виды токенов

Каждый токен имеет срок жизни, то есть через какое-то время он становится не валидным. Сделано в целях безопасности.

Как получить новый токен после старого? Неужели каждый раз придется заново логиниться? Нет, на этот случай придумали два вида токенов:

![tokens](https://i.ibb.co/jgFzcZk/tokens.jpg)

(!) Флаг httpOnly  не разрешает изменение cookie  через JS. Это компетенция только сервера. Refresh  токен записывается в БД на сервере и формируется **сессия**. PS: также можно записывать IP  адрес устройства, fingerprint или просто версию браузера (сомнительная идея) и, если обнаружен другой ip и пр., отправлять уведомление безопасности пользователю.

# Взаимодействие браузера и клиента

1.	В теле запроса указываем {email, password} и отправляем на сервер. 
2.	Сервер в ответ генерирует {access, refresh} токены. Access токен сохраняется сразу же в localStorage, а refresh токен сервер установил нам в cookie. Успешно вошли. 
3.	Теперь, например, отправляем GET запрос на получение сообщения. К этому запросу добавим header с меткой Bearer, который записывает access токен, и отправляем запрос на сервер.
4.	Первое, что делает сервер – проверяет токен. Если он валидный, то сервер возвращает статус-код 200 и сообщение.
5.	Если истек срок действия access токена, то он не валидный. Сервер вернет статус-код 401 и сообщение.

Нужно предусмотреть такое поведение и на 401 статус установить **перехватчик, т.е. интерцептор**. В этот момент отправляем запрос на обновление access токена. В куках уже есть refresh токен! Сервер сверит его с тем, что уже есть в БД и вернет новую пару access и refresh токенов.

## Зачем возвращать новую пару токенов

Ответ очевиден: для того, чтобы не разлогиниться или для того, чтобы открыть ноутбук через 15 дней и в той же вкладке нажать кнопку "Получить пользователей". Access token давно не валидный, но Refresh token по-прежнему рабочий, поэтому он сформирует новую пару и мы увидим список пользователей. Для пользователя ничего сверхестественного не произошло, но под капотом происходит целый ряд манипуляций для того, чтобы сделать пользование приложением комфортным. Мы его не выкидываем из учетной записи, а просто обновляем пару токенов.


## База данных

Я решил создать свою БД, в которой буду хранить пользователей и токены. Использовал Mongo. Соответственно, нужны библиотеки mongodb и mongoose для работы с типами данных схем. Обратите внимание на то, как устроены поля в tokens:

![token](https://i.ibb.co/GTfHCsK/token.jpg)

А также на то, как устроены поля в users: 

![users](https://i.ibb.co/XXhKccJ/users.jpg)

Пароль ни в коем случае не должен храниться в открытом виде! Его обязательно нужно или хешировать, или шифровать. Что лучше? Мое мнение - хеширование. Если злоумышленник получит доступ к ключу шифрования, то вам уже ничего не поможет от слива базы данных в сеть, а если у вас онлайн-магазин, ищите карточки своих пользователей на кардерских форумах. Хеширование, на мой взгляд, лучшее решение, причем расхешировать обратно пароль невозможно. А вот токен декодировать легче простого: [декодировать токен](https://jwt.io/).

![decoding](https://i.ibb.co/QN6j5JB/decoding.jpg)

>Обратите внимание, что поле isActivated отрабатывает, как следует. Если перейдете по ссылке, то false станет true. 

## Postman

Когда работаете только с сервером и фронтенда никакого пока нет, используйте postman. Схема работы очень простая. Покажу основные моменты, которые я отработал.

1.  Авторизация. POST - запрос, формат JSON. Получили токены и информацию о пользователе. Напоминаю, есть требования к стилю написанию почты и пароля (синтаксис и длина).

![login-postman](https://i.ibb.co/B2NXDWL/login.jpg)

2.  Регистрация. POST - запрос формата JSON.

Удачная регистрация.  
  
![goog-reg](https://i.ibb.co/XVYbkqC/goodreg.jpg)

Неудачная регистрация. Пользователь уже зарегистрирован.

![bad-reg](https://i.ibb.co/sbmxpQC/badreg.jpg)

Ошибка валидации (синтаксис и пароль).

![enter image description here](https://i.ibb.co/NCFBkKj/valid.jpg)

3. Получить список пользователей. GET- запрос с access token в header Bearer.

Запрос удовлетворен, так как валидный access токен.

![good-token](https://i.ibb.co/ftcz0mq/goodtoken.jpg)

Запрос отклонен, так как не валидный access токен.

![bad-token](https://i.ibb.co/q9jyqY6/bad-token.jpg)

4. Обновление пары токенов. GET - запрос. Refresh.

![refresh](https://i.ibb.co/M1CTG9X/refresh.jpg)

## Как отработают токены?

На этом блоке можно легко объяснить основную задачу токенов. Поставим на access 15 сек, а на refresh 30 сек (./server/service/token-service). Поведение приложение будем отслеживать во вкладке network. 

Войдем в аккаунт и будем кликать кнопку для получения списка пользователей. Access токен стал невалидным, сетевой запрос закрашился, но мы не разлогинились, так как сработал **интерцептор**, который перехватил невалидный access токен и через еще живой refresh токен обновил пару токенов, поэтому визуально для нас ничего не произошло, мы просто получили список пользователей.

![network-access](https://i.ibb.co/MM2Cx6H/network.jpg)

Если будем ожидать в бездействии, то через 15 секунд сломается access токен, а через 30 секунд сломается refresh токен, после чего нас просто выкинет из учетной записи:

![bad-network](https://i.ibb.co/ySg5RPv/bad-network.jpg)

Обновим страницу и убедимся в этом:

![empty](https://i.ibb.co/fCt69W8/empty.jpg)


