#!/usr/bin/env node
K=require('keypress')
O=require('ansi')(process.stdout)
E=require('child_process').execSync
I=require('prompt-sync')()
R=require('robotjs')
C=require('copy-paste')
stack=[]
buf=''
vars={
  pi:Math.PI+'',
  e:Math.E+''
}
und=[stack]
red=[]

O.write('\033c\n–>\t')
K(process.stdin)

sto=_=>{
  _!='u'&&_!='r'?(und.push(stack),red=[]):(stack=und[und.length-1])
  O.reset().write('\033c'+stack.map((a,b)=>b+'\t'+a).reverse().join`\n`)
  O.write('\n–>\t'+buf)
}

//ex mode
exec=x=>{
  O.reset()
  x.split` +`.map(a=>{
    a=='q'?
      process.exit(0)

    //bulk stack commands
    :a=='r'?
      stack.reverse()
    :a=='c'?
      (stack=[])

    //rounding
    :a=='trunc'?
      (stack[0]=0|stack[0])
    :a=='floor'?
      (stack[0]=Math.floor(stack[0]))
    :a=='round'?
      (stack[0]=Math.round(stack[0]))
    :a=='ceil'?
      (stack[0]=Math.ceil(stack[0]))

    :0
  })
}

read=x=>{
  O.horizontalAbsolute(0).eraseLine()
  process.stdin.pause()
  x()
  process.stdin.resume()
}

//main process
process.stdin.on('keypress',key=(a='',b='')=>{
  //num
  a.match(/^\d$/)||(a=='e'&&buf)||(a=='.'&&!buf.match(/\./))?
    (buf+=a)
  :(a==' '||a=='\r'||a=='\n')&&buf?
    (stack.unshift(buf),buf='')
  :(a=='backspace'||b.name=='backspace')&&buf?
    (buf=buf.slice(0,-1))

  //copy-paste
  :a=='y'&&stack[0]?
    (C.copy(stack.shift()),stack.unshift(''))
  :a=='p'?
    stack.unshift(C.paste())

  //undo/redo
  :a=='u'&&und.length>1?
    red.push(und.pop())
  :a=='r'&&red.length?
    und.push(red.pop())

  //math
  :a=='_'&&stack[0]?
    (stack[0]=''+-stack[0])
  :a.match(/^[+\-*/%]$/)&&stack[1]?
    stack.unshift(eval(`${+stack.splice(1,1)} ${a} ${+stack.shift()}`))
  :a=='^'&&stack[1]?
    stack.unshift(Math.pow(stack.splice(1,1),stack.shift()))
  :a=='v'&&stack[0]?
    (stack[0]=Math.sqrt(stack[0]))
  :a=='?'?
    stack.unshift(Math.random()*2|0)

  //stack
  :a=='$'&&stack[0]?
    stack.unshift(stack[0])
  :a=='!'&&stack[0]?
    stack.shift()
  :a=='\\'&&stack[1]?
    stack.unshift('',stack.splice(1,1))
  :a=='@'&&stack[2]?
    stack.splice(stack.length>2?2:1,0,stack.shift())
  :a=='#'&&stack[1]?
    stack.unshift(stack[1])

  //ex mode
  :a==';'?
    read(_=>(O.green(),exec(I(';>\t')||'')))

  //vars
  :a=='='?
    read(_=>(O.blue(),(v=I('=>\t'))&&stack[0]&&(vars[v]=stack.shift())))
  :a=='|'?
    read(_=>(O.blue(),vars[v=I('|>\t')]&&stack.unshift(vars[v])))

  :0

  sto(a)
})

process.stdin.setRawMode(true);
process.stdin.resume();
