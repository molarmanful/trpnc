#!/usr/bin/env node
K=require('keypress')
O=require('ansi')(process.stdout)
E=require('child_process').execSync
stack=['']

process.stdout.write('\033c')
K(process.stdin)

sto=_=>(
  stack=stack.filter((x,y)=>x||!y),
  process.stdout.write('\033c'+stack.slice(0).reverse().join`\n`),
  O.goto(stack[0].length+1,stack.length)
)

process.stdin.on('keypress',(a,b)=>{
  a=='q'||a=='\u001b'?
    process.stdin.pause()
  :a.match(/^[\d.]+$/)||a=='e'&&stack[0]?
    (stack[0]+=a)
  :(a==' '||a=='\r')&&stack[0]?
    (stack[0]=eval(stack[0])+'',stack.unshift(''))
  :a=='_'?
    (stack[0]=''+-stack[0])
  :b&&b.name=='backspace'?
    (stack[0]=stack[0].slice(0,-1))
  :a.match(/^[+\-*/%^]$/)&&stack.length>1?
    (stack[0]||stack.shift(),stack.unshift('',eval(`${stack.splice(1,1)} ${a.replace('^','**')} ${stack.shift()}`)))
  :a=='v'?
    (stack[0]**=.5)
  :a=='$'&&(stack[0]||stack[1])?
    stack.unshift(stack[0]||stack[1])
  :a=='!'&&(stack[0]||stack[1])?
    (stack[0]||stack.shift(),stack[0]='')
  :a=='\\'&&stack[1]?
    (stack[0]||stack.shift(),stack.unshift(stack.splice(1,1)))
  :0
  sto()
})

process.stdin.setRawMode(true);
process.stdin.resume();
