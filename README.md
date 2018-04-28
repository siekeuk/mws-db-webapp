# mws-db-webapp
特定の形式でMongoDBに格納されたMagic: The Gatheringのカードデータを閲覧したりしなかったりするウェブアプリケーションです。

## Description
このウェブアプリはMagic: The Gatheringの公式カードではなく、オリジナルカードデータを想定しています。具体的には、[Magic Set Editor](http://magicseteditor.sourceforge.net/)(以下MSE)で作成され、[Magic Workstation](http://www.magicworkstation.com/)(以下MWS)形式で出力されたカードデータです。

MongoDBに投入された上記カードデータに対し、以下の機能を提供します。
- カードの検索・閲覧
- 作成デッキの投稿・閲覧

## Requirement
* Node.js および npm もしくは yarn
* MongoDB  
事前にMongoDBへカードデータの投入が必要です。  
別途MWS形式からMongoDBにコンバートとインポートを行うバッチあり。

## Usage
### Settings
以下`config`の情報です。
* `prop.db` - MongoDBの接続情報です。
* `resData` - 基本的に\<meta\>タグ情報ですが一部情報はサイトの表示に利用されます。
* `releaseDate` - カードの版情報です。新しいものが昇順になるように設定してください。
* `expansion` - カードセット情報です。プロパティに略号を、値にエキスパンション名を設定してください。
* `log4js` - ロガーの設定です。

### Install
```shell
npm install
```
※`package.json`のsemver指定が適当すぎるため往々にして悲劇が起きます。
### Run
```sh
#NODE_ENV=develop
npm test
```
もしくは
```sh
#NODE_ENV=production
npm start
```
環境変数`PORT`の指定がない場合、`8081`ポートで起動します。  
変更したい場合は`package.json`の`scripts`を編集する等してください。

## Hints
個人的な利用を想定しているため、クレデンシャルな情報の扱いがぬるいです。  
利用の際は留意してください。

## License
MIT