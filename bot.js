//https://t.me/regra_de_3_bot
//@regra_de_3_bot
const { Telegraf, session, Markup } = require('telegraf')
const { message } = require('telegraf/filters')

require('dotenv').config();

//TODO na regra de 3 composta existe erro ainda quando a variavel X nao esta no indice 0

const token_bot = process.env.TOKEN;
const bot = new Telegraf(token_bot)

bot.use(session());

// Teclado numérico
const tecladoNumerico = Markup.keyboard([
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['0', '🔙 Apagar', '✅ OK']
]).resize().oneTime();

function comandos(ctx) {
    ctx.reply('\nOs comandos são estes:\n');
    ctx.reply("/simples - para regra de 3 simples");
    ctx.reply("/composta - para regra de 3 composta");
    ctx.reply("/temperatura - transformar uma temperatura de Celsius pra Farenheit e Kelvin");
    ctx.reply("/start - para iniciar");
    ctx.reply("/opcoes - menu grafico para os comandos de calculo");
    ctx.reply("\ne a qualquer tempo vc pode dizer 'hi' ou dar um 'oi'!");
    ctx.reply("/help - mostrar os comandos disponiveis");
}

bot.start((ctx) => {
    ctx.session = null;
    ctx.reply('Bem-vindo ao Regra de 3');
    comandos(ctx)
})

bot.help((ctx) => {
    comandos(ctx)
})

bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.hears('Hi', (ctx) => ctx.reply('Hey there'));
bot.hears('oi', (ctx) => ctx.reply('Fala mano!'));
bot.hears('Oi', (ctx) => ctx.reply('Fala mano!'));
bot.hears('obrigado', (ctx) => ctx.reply('De nada.'));
bot.hears('Obrigado', (ctx) => ctx.reply('De nada.'));
bot.hears('Ajuda', (ctx) => comandos(ctx));
bot.hears('Me ajude', (ctx) => comandos(ctx));
bot.hears('Quais as opções?', (ctx) => comandos(ctx));
bot.hears('obg', (ctx) => ctx.reply('De nada.'));
bot.hears('tchau', (ctx) => ctx.reply('Falou Brother!'));
bot.hears('Tchau', (ctx) => ctx.reply('Falou Brother!'));

bot.command("opcoes", (ctx)=>{
    ctx.reply('O que você deseja fazer?', Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Converter Temperaturas', 'temperatura')],
    [Markup.button.callback('📐 Regra de 3 Simples', 'simples')],
    [Markup.button.callback('📐 Regra de 3 Composta', 'composta')]
  ]));
})

bot.action("simples", (ctx)=>{
    ctx.answerCbQuery();
    ctx.session = { step: 'regra3_a', buffer: '' };
    ctx.reply('Digite o valor de A:');
})

bot.action("temperatura", (ctx)=>{
    ctx.answerCbQuery();
    ctx.session = { step: 'temperaturaC', buffer: '' };
    ctx.reply('Digite a temperatura em Celsius:');
})

bot.action("composta", (ctx)=>{
    ctx.answerCbQuery();
    ctx.session =  { step: 'numerador'};
    ctx.reply('Digite as grandezas do numerador separado por virgula. Coloque x na grandeza que deseja calcular.');
})

bot.command("composta", (ctx)=> {
    ctx.session =  { step: 'numerador'};
    ctx.reply('Digite as grandezas do numerador separado por virgula. Coloque x na grandeza que deseja calcular.');

});

bot.command("simples", (ctx)=>{
    ctx.reply('Objetivo é fazer a seguinte razão:')
    ctx.reply('A------B');
    ctx.reply('C------X');
    ctx.reply('Para buscar o valor de X')
    ctx.session = { step: 'regra3_a' };
    ctx.reply('Digite o valor de A:');
})

bot.command("temperatura", (ctx)=>{
    ctx.session = { step: 'temperaturaC' };
    ctx.reply('Digite o valor da temperatura em Celsius:')
})

bot.on(message("text"), (ctx)=>{
    const step = ctx.session?.step;
    if (step === 'regra3_a') {
        const a = parseFloat(ctx.message.text);
        if (isNaN(a) || a === 0) {
        return ctx.reply('Valor inválido. A não pode ser zero.');
        }
        ctx.session.a = a;
        ctx.session.step = 'regra3_b';
        return ctx.reply('Agora, digite o valor de B:');
    }

    if (step === 'regra3_b') {
        const b = parseFloat(ctx.message.text);
        if (isNaN(b) || b === 0) {
        return ctx.reply('Valor inválido. B não pode ser zero.');
        }
        ctx.session.b = b;
        ctx.session.step = 'regra3_c';
        return ctx.reply('Agora, digite o valor de C:');
    }

    if (step === 'regra3_c') {
        const c = parseFloat(ctx.message.text);
        if (isNaN(c) || c === 0) {
        return ctx.reply('Valor inválido. C não pode ser zero.');
        }
        const {a, b} = ctx.session;

        const x = (b * c) / a;

        ctx.reply(`${a} está para ${b}, assim como ${c} está para *${x}*`, { parse_mode: 'Markdown' });
        ctx.session = null;
        return;
    }

    if (step === "temperaturaC" ) {
         const celsius = parseFloat(ctx.message.text);
         const f = ((9*celsius)/5) + 32
         const k = 273 + celsius
         ctx.reply(
            `${celsius}°C equivale a:\n` +
            `🌡️ ${f.toFixed(2)}°F\n` +
            `❄️ ${k.toFixed(2)} K`
            );
          ctx.session = null;
        return;
    }

    if (step === "numerador") {
        const numerador = ctx.message.text;
        ctx.session.numerador = numerador;
        ctx.session.step = 'denominador';
        return ctx.reply('Agora, digite o valor das grandezas do denominador. Se houver o valor que deseja calcular, coloque x');
    }

    if (step === "denominador") {
        const denominador = ctx.message.text;
        ctx.session.denominador = denominador;
        ctx.session.step = 'inverter';
        return ctx.reply("Digite uma sequencia de 'i' para inverter e 'd' para nao inverter. Deve ser separada por virgula e ter o mesmo numero das grandezas. Aguarde o cálculo no final.");
    }

    if (step === "inverter") {
        const inverter = ctx.message.text;
        const {numerador, denominador} = ctx.session;
        
        if (denominador.split(',').length != numerador.split(',').length) {
            ctx.session = null;
            return ctx.reply('Invalido! O numero de grandezas tem que ser igual. Abortando operação.')
        }

        if (inverter.split(',').length != numerador.split(',').length) {
            ctx.session = null;
            return ctx.reply('Invalido! O numero de grandezas tem que ser igual. Abortando operação.')
        }

        let sinv = inverter.split(',');
        let snum = numerador.split(',');
        let sden = denominador.split(',');

        // deslocar X para o inicio [0]
        let indiceX = snum.indexOf('x');
        if (indiceX < 0) {
            indiceX =  sden.indexOf('x');
        }
        const tempN = snum[0];
        const tempD = sden[0];
        const tempI = sinv[0];
        snum[0] = snum[indiceX];
        sden[0] = sden[indiceX];
        sinv[0] = sinv[indiceX];
        snum[indiceX] = tempN;
        sden[indiceX] = tempD;
        sinv[indiceX] = tempI;

        // aplicar a inversao, caso exista
        for(let i = 0; i < sinv.length; i++) {
            if (sinv[i] === 'i') {
                const temp = snum[i];
                snum[i] = sden[i];
                sden[i] = temp;
            }
        }
        // calcular resultado
        let resultado = 1;
        for(let i = 1; i < sinv.length; i++) {
            resultado *= parseFloat(snum[i]) / parseFloat(sden[i]);
        }

        if (snum[0] === 'x') {
            resultado *= parseFloat(sden[0]) 
        } else {
            resultado = parseFloat(snum[0]) / resultado;
        }

        ctx.reply(`X=${resultado.toFixed(4)}`);
        ctx.session = null;
        return;
    }

});



// escuta qualquer texto (com regex genérico)
//bot.hears(/.*/, (ctx) => {
//  ctx.reply('Você enviou uma mensagem de texto!');
//});

bot.launch();