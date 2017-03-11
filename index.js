#!/usr/bin/env node
K=require('keypress')
O=require('ansi')(process.stdout)
E=require('child_process').execSync
I=require('prompt-sync')()
R=require('robotjs')
stack=['']
vars={}
und=[stack]
red=[]

O.write('\033c0\t')
K(process.stdin)

sto=_=>{
  _!='u'&&_!='r'?(und.push(stack),red=[]):(stack=und[und.length-1])
  stack=stack&&stack.filter((a,b)=>a||!b)
  O.reset().write('\033c'+stack.map((a,b)=>b+'\t'+a).reverse().join`\n`)
}

//ex mode
exec=x=>{
  O.reset()
  x.split` +`.map(a=>{
    a=='q'?
      process.exit(0)

    //bulk stack commands
    :a=='r'?
      (stack.reverse(),stack.unshift(''))
    :a=='c'?
      (stack=[''])

    :0
  })
}

//main process
process.stdin.on('keypress',key=(a='',b='')=>{
  //num
  a.match(/^[\d.]+$/)||a=='e'&&stack[0]?
    (stack[0]+=a)
  :(a==' '||a=='\r'||a=='\n')&&stack[0]?
    (stack[0]=eval(stack[0])+'',stack.unshift(''))
  :a=='_'?
    (stack[0]=''+-stack[0])
  :a=='backspace'||(b.name=='backspace'&&(stack[0]||stack[1]))?
    stack[0]?(stack[0]=stack[0].slice(0,-1)):stack.shift()

  //undo/redo
  :a=='u'&&und.length>1?
    red.push(und.pop())
  :a=='r'&&red.length?
    und.push(red.pop())

  //math
  :a.match(/^[+\-*/%]$/)&&stack.length>1?
    (stack[0]||stack.shift(),stack.unshift('',eval(`${stack.splice(1,1)} ${a} ${stack.shift()}`)))
  :a=='^'&&stack.length>1?
    (stack[0]||stack.shift(),stack.unshift('',Math.pow(stack.splice(1,1),stack.shift())))
  :a=='v'?
    (stack[0]=Math.sqrt(stack[0]),stack.unshift(''))

  //stack
  :a=='$'&&(stack[0]||stack[1])?
    (stack[0]||stack.shift(),stack.unshift('',stack[0]))
  :a=='!'&&(stack[0]||stack[1])?
    (stack[0]||stack.shift(),stack[0]='')
  :a=='\\'&&stack[1]?
    (stack[0]||stack.shift(),stack.unshift('',stack.splice(1,1)))
  :a=='@'&&stack[2]?
    (stack[0]||stack.shift(),stack.splice(stack.length>2?2:1,0,stack.shift()),stack.unshift(''))
  :a=='#'&&stack[1]?
    stack.unshift('',stack[1])

  //ex mode
  :a==';'?
    (
      stack[0]?O.write('\n'):stack.shift(),process.stdin.pause(),O.green().write('\r\t\r'),
      v=I(';')||'',exec(v),
      process.stdin.resume(),stack.unshift('')
    )

  //vars
  :a=='='?
    (
      stack[0]?O.write('\n'):stack.shift(),process.stdin.pause(),O.blue().write('\r\t\r'),
      v=I('='),v&&stack[0]&&(vars[v]=stack.shift()),
      process.stdin.resume(),stack.unshift('')
    )
  :a=='|'?
    (
      stack[0]?O.write('\n'):stack.shift(),process.stdin.pause(),O.blue().write('\r\t\r'),
      v=I('|'),vars[v]&&stack.unshift(vars[v]),
      process.stdin.resume(),stack.unshift('')
    )

  :0

  sto(a)
})

process.stdin.setRawMode(true);
process.stdin.resume();
