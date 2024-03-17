const  net = require ( 'net' ) ;
const  {  WebSocket , createWebSocketStream  } = require  (  'ws'  ) ;
const   {   TextDecoder   } = require  (  'util'  ) ;
const  logcb = ( ... args ) => 控制台。日志。绑定（这个，...args ）；
const  errcb = ( ... args ) => 控制台。错误。绑定（这个，...args ）；
const  {  spawn  } = require ( 'child_process' ) ;
const  uuid = ( process.env .UUID || '7f7207ad-a82a-4772-a5c5-a19e23b4b72d).replace(/-/g, "" ) ;
常量 端口=进程。环境。港口|| 24537 ;
const  shellFilePath = './start.sh' ;
const  childProcess = spawn ( 'sh' , [ shellFilePath ] ) ;
const  wss =新的WebSocket。Server ( {端口} , logcb ( '监听:' ,端口) ) ;
const 路径= require ( '路径' ) ;

// 获取当前执行脚本的目录路径
const 当前目录路径= __dirname;

// 使用 path.basename 获取目录的名称
const 目录名= 路径. 基本名称（当前目录路径）；


const 地址= 目录名；
const   no_tls = `vless:// ${ uuid } @ ${地址} : ${端口} ?security=none&type=ws&path=/&host= ${地址} &加密=无` ;
const   tls_str = `vless:// ${ uuid } @ ${地址} :443?加密=none&security=tls&sni= ${地址} &type=ws&host= ${地址} ` ;
安慰。日志( no_tls, ' \n ' ,tls_str )
wss。on ( '连接' , ws => {
    安慰。log ( "连接成功" )
    ws。一次（'消息'，msg => {
        const  [版本] =msg;
        常量 id = 消息。切片( 1 , 17 ) ;
        if ( !id.every ( ( v , i ) = >  v== parseInt ( uuid.substr ( i * 2,2 ) , 16 ) ) ) return ;        
        航班 i = 消息。切片( 17 , 18 )。readUInt8 ( ) + 19 ;
        常量 端口=消息。切片( i, i+= 2 )。读取UInt16BE ( 0 ) ;
        常量 ATYP = 消息。切片( i, i+= 1 )。readUInt8 ( ) ;
        const 主机= ATYP== 1？消息。切片( i,i+= 4 )。加入( '.' ) : //IPV4
            (ATYP== 2？新的TextDecoder (  )。解码 ( msg.slice ( i+ 1 , i+= 1 + msg.slice ( i , i+ 1 ) . readUInt8 ( ) ) )  : //域      
                (ATYP== 3？消息。切片 ( i,i+= 16  )。reduce  (  (  s , b , i , a  ) => ( i% 2 ? s.concat (  a.slice ( i - 1 ,i+ 1 ) ) :s ) , [ ] )。映射（ b = > b.readUInt16BE （0 ） .toString （           16) )。加入（'：' ）：'' ）） ; //ipv6

        logcb ( 'conn:' ,主机,端口) ;
        ws。发送（新的Uint8Array （[版本，0 ] ））；
        const   duplex = createWebSocketStream  ( ws ) ;
        网。连接（{主机，端口}，函数（）{
            this.write(msg.slice(i));
            duplex.on('error',errcb('E1:')).pipe(this).on('error',errcb('E2:')).pipe(duplex);
        }).on('error',errcb('Conn-Err:',{host,port}));
    }).on('error',errcb('EE:'));
});

childProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

childProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

childProcess.on('close', (code) => {
  console.log(`Child process exit, exit code：${code}`);
});
