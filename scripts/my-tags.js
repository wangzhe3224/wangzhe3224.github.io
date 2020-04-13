//const abc = require('abcjs');
//const clsx = require('clsx');
//import abcjs from "abcjs";


// write a random message on building
hexo.extend.tag.register('mytags_say', function (args) {
 
    // use the given say type or defaul to simpsons
    var sayType = args[0] || 'simpsons',
 
    data = {
 
        simpsons : {
 
            defaultName : 'The Simpsons',
 
            says : [
 
                ['I’d rather let a thousand guilty men go free than chase after them.', 'Chief Wiggum'],
                ['It’s all over, people! We don’t have a prayer!', 'Reverend Lovejoy'],
                ['Inflammable means flammable? What a country.', 'Dr. Nick Riviera'],
                ['My eyes! The goggles do nothing!', 'Rainer Wolfcastle'],
                ['Oh, loneliness and cheeseburgers are a dangerous mix.', 'Comic Book Guy']
 
            ]
        },
 
        watts : {
 
            defaultName : 'Allen Watts',
 
            says : [
 
                'No valid plans for the future can be made by those who have no capacity for living now. ',
                'You do not play a sonata in order to reach the final chord, and if the meanings of things were simply in ends, composers would write nothing but finales.',
                'Human desire tends to be insatiable.'
            ]
        }
 
    },
 
    len = data[sayType].says.length,
 
    index = Math.floor(Math.random() * len),
 
    text = data[sayType].says[index];
 
    if (typeof text === 'object') {
 
        text = '\"' + text[0] + '\" -' + text[1];
 
    } else {
 
        text = '\"' + text + '\" -' + data[sayType].defaultName;
 
    }
 
    return '<span style="font-weight: bold;">' + text + '</span>';
 
});
