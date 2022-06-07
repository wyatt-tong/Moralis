const Koa = require('koa');
const fs = require('fs');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const send = require('koa-send');
const query = require('./query')
const app = new Koa();
app.use(bodyParser());

// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});


router.get('/', async (ctx, next) => {
    ctx.response.body = `<h1>Index</h1>
        <form action="/download" method="post">
            <p>Your Wallet Address: <input name="address" value="0xad1d9d536d2ec0da134cd6eba570b62c734ea2ed"></p>
            <p><input type="submit" value="Download CSV"></p>
        </form>`;
});

router.post('/download', async (ctx, next) => {
    var
        address = ctx.request.body.address || '';
    if (address != "" && address != null && address != undefined) {
        let file_name = address + ".csv";
        await query.convert(address);
        if(fs.existsSync(file_name)){
            await ctx.attachment(file_name);
            await send(ctx, file_name);
        }
        else{
            ctx.response.body = `<h1>Getting data from server, please wait a few seconds and try again.</h1>`;
        }   
    } else {
        ctx.response.body = `<h1>Address cannot be empty!</h1>
        <p><a href="/">Back to Index</a></p>`;
    }
});

// add router middleware:
app.use(router.routes());

app.listen(3005);
console.log('app started at port 3005...');