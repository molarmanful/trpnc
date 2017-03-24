#!/usr/bin/env node
K=require('keypress')
O=require('ansi')(process.stdout)
E=require('child_process').execSync
I=require('prompt-sync')()
C=require('copy-paste')
R=require('robotjs')
stack=[]
buf=''
vars={
  pi:Math.PI+'',
  e:Math.E+''
}
macs={}
und=[]
red=[]

O.write('\033c\n–>\t')
K(process.stdin)

sto=_=>{
  _!='u'&&_!='r'&&stack.some((a,b)=>a!=(und[und.length-1]||[])[b])&&(und.push(stack.slice()),red=[])
  O.reset().write('\033c'+stack.map((a,b)=>b+'\t'+a).reverse().join`\n`)
  O.write('\n–>\t'+buf)
}

//ex mode
exec=x=>{
  O.reset()
  x.split` +`.map(a=>{
    a=='q'?
      process.exit(0)
    :a=='e'?
      (buf=stack.shift())

    //bulk stack commands
    :a=='r'?
      stack.reverse()
    :a=='c'?
      (stack=[])
    :a=='s'?
      (stack.sort((a,b)=>b-a))
    :a=='S'?
      (stack.sort(_=>.5-Math.random()))
    :a=='max'?
      stack.unshift(Math.max(...stack))
    :a=='min'?
      stack.unshift(Math.min(...stack))

    //rounding
    :a=='trunc'?
      (stack[0]=0|stack[0])
    :a=='floor'?
      (stack[0]=Math.floor(stack[0]))
    :a=='round'?
      (stack[0]=Math.round(stack[0]))
    :a=='ceil'?
      (stack[0]=Math.ceil(stack[0]))

    //logs
    :a=='ln'?
      stack.unshift(Math.log(stack.shift()))
    :a=='lt'?
      stack.unshift(Math.log10(stack.shift()))
    :a=='log'?
      stack.unshift(Math.log(stack.shift())/Math.log(stack.shift()))

    :0
  })
}

read=x=>{
  O.horizontalAbsolute(0).eraseLine()
  x()
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
  :a=='u'&&und[0]?
    (red.push(und.pop()),stack=und[und.length-1]||[])
  :a=='r'&&red[0]?
    (und.push(red.pop()),stack=und[und.length-1]||[])

  //math
  :a=='_'&&stack.length?
    (stack[0]=''+-stack[0])
  :a.match(/^[+\-*/%]$/)&&stack[1]?
    stack.unshift(eval(`${+stack.splice(1,1)} ${a} ${+stack.shift()}`))
  :a=='^'&&stack.length>1?
    stack.unshift(Math.pow(stack.splice(1,1),stack.shift()))
  :a=='v'&&stack.length?
    (stack[0]=Math.sqrt(stack[0]))
  :a=='?'?
    stack.unshift(Math.random())

  //stack
  :a=='$'&&stack.length?
    stack.unshift(stack[0])
  :a=='!'&&stack.length?
    stack.shift()
  :a=='\\'&&stack.length>1?
    stack.unshift('',stack.splice(1,1))
  :a=='@'&&stack.length>2?
    stack.splice(stack.length>2?2:1,0,stack.shift())
  :a=='#'&&stack.length>1?
    stack.unshift(stack[1])

  //ex mode
  :a==';'?
    read(_=>(O.green(),exec(I(';>\t')||'')))

  //vars
  :a=='='?
    read(_=>(O.blue(),(v=I('=>\t'))&&stack[0]&&(vars[v]=stack.shift())))
  :a=='|'?
    read(_=>(O.blue(),vars[v=I('|>\t')]&&stack.unshift(vars[v])))

  //macros
  :a=='['?
    read(_=>(
      O.cyan(),
      v=I('[:\t'),v&&(
        macs[v]=(I('[>\t')||'')
          .replace(/<cr>/ig,'\r')
          .replace(/<bs>/ig,'\b')
      )
    ))
  :a==']'?
    read(_=>(O.cyan(),v=I(']>\t'),macs[v]&&R.typeString(macs[v])))

  :0

  sto(a)
})

process.stdin.setRawMode(true);
process.stdin.resume();
