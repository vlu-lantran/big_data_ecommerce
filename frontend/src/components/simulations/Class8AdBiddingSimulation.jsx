import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

export default function Class8AdBiddingSimulation({ apiBaseUrl }) {
  // Persistence Keys
  const STORAGE_KEY_ROLE = 'rtb_role';
  const STORAGE_KEY_BRAND = 'rtb_brand';
  const STORAGE_KEY_ARCHETYPE = 'rtb_archetype';

  const archetypeLabels = {
    SneakerX: "Giày Sneaker & Thời trang",
    TechGadget: "Đồ công nghệ & Phụ kiện",
    GlowBeauty: "Mỹ phẩm & Chăm sóc da",
    FitGear: "Dụng cụ & Đồ tập Gym"
  };

  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_KEY_ROLE)); 
  const [myBrandName, setMyBrandName] = useState(() => localStorage.getItem(STORAGE_KEY_BRAND) || '');
  const [myArchetype, setMyArchetype] = useState(() => localStorage.getItem(STORAGE_KEY_ARCHETYPE));
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myBid, setMyBid] = useState('');
  const [isDisconnected, setIsDisconnected] = useState(false);
  
  const [gameState, setGameState] = useState({
    currentRoundIndex: -1,
    players: {}, 
    result: null,
    showPhase1Rules: false,
    showPhase1Summary: false,
    showPhase2Rules: false,
    showFinalSummary: false,
    scenariosCount: 0,
    currentScenario: null,
    timeLeft: 0
  });

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Persistence Effect
  useEffect(() => {
    if (role) localStorage.setItem(STORAGE_KEY_ROLE, role);
    if (myBrandName) localStorage.setItem(STORAGE_KEY_BRAND, myBrandName);
    if (myArchetype) localStorage.setItem(STORAGE_KEY_ARCHETYPE, myArchetype);
  }, [role, myBrandName, myArchetype]);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current) socketRef.current.close();

    const wsUrl = apiBaseUrl.replace('http', 'ws') + '/api/simulations/lesson-8-sync/ws';
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('RTB Arena: Connection Established');
      setLoading(false);
      setIsDisconnected(false);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

      // Heartbeat
      const heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'PING' }));
        } else {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Auto-rejoin
      if (myBrandName && myArchetype) {
        socket.send(JSON.stringify({ 
          type: 'JOIN_GAME', 
          payload: { name: myBrandName, archetype: myArchetype } 
        }));
        setIsJoined(true);
      }
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'STATE_UPDATE') {
        setGameState(message.payload);
      } else if (message.type === 'TIMER_TICK') {
        setGameState(prev => ({ ...prev, timeLeft: message.payload.timeLeft }));
      } else if (message.type === 'ERROR') {
        alert("SERVER ALERT: " + message.payload);
      }
    };

    socket.onclose = () => {
      console.warn('RTB Arena: Connection Lost. Retrying in 3s...');
      setIsDisconnected(true);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = (err) => {
      console.error('RTB Arena: WebSocket Error', err);
      socket.close();
    };
  }, [apiBaseUrl, myBrandName, myArchetype]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connectWebSocket]);

  const sortedLeaderboard = useMemo(() => {
    return Object.entries(gameState.players).map(([name, data]) => ({
      name, ...data, total: 50 + data.profit
    })).sort((a, b) => b.total - a.total);
  }, [gameState.players]);

  const sendAction = (type, payload = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
    } else {
      setIsDisconnected(true);
    }
  };

  const joinGame = () => {
    if (!myBrandName || !myArchetype) return;
    sendAction('JOIN_GAME', { name: myBrandName, archetype: myArchetype });
    setIsJoined(true);
  };

  const submitBid = () => {
    if (!isJoined) return;
    sendAction('SUBMIT_BID', { name: myBrandName, amount: parseFloat(myBid) || 0 });
    setMyBid('');
  };

  const nextScenario = () => sendAction('NEXT_PHASE');
  const restartSimulation = () => {
    localStorage.clear();
    window.location.reload();
  };
  const triggerRestartOnServer = () => sendAction('RESTART');
  const forceAuction = () => sendAction('FORCE_AUCTION');

  const renderLeaderboardUI = (title, description, btnText) => {
    return (
      <div className="bg-white p-6 rounded-2xl border border-blue-200 text-center shadow-md animate-fade-up max-w-2xl mx-auto">
        <h4 className="text-2xl font-bold text-slate-800 mb-2">🏆 {title}</h4>
        <p className="text-slate-600 mb-6">{description}</p>
        <div className="space-y-3 text-left">
          {sortedLeaderboard.slice(0, 10).map((p, index) => (
            <div key={p.name} className={`flex justify-between items-center p-4 rounded-xl border ${index < 3 ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                <div>
                  <p className="font-bold text-slate-800 leading-none">{p.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{archetypeLabels[p.archetype] || p.archetype}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-lg ${p.total >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>${p.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        {role === 'teacher' && (
          <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-blue-700 w-full" onClick={nextScenario}>
            {btnText} →
          </button>
        )}
      </div>
    );
  };

  const renderRules = (title, subtitle, rules, btnText) => (
    <div className="bg-white p-8 rounded-3xl border border-blue-200 text-center shadow-xl animate-fade-up max-w-3xl mx-auto overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
      <h4 className="text-3xl font-black text-slate-800 mb-2 italic uppercase">{title}</h4>
      <p className="text-lg text-blue-600 font-bold mb-8 uppercase tracking-widest">{subtitle}</p>
      <div className="text-left space-y-4 text-slate-700 bg-slate-50 p-8 rounded-2xl border border-slate-200 mb-8 shadow-inner">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">{idx + 1}</div>
            <span className="font-medium leading-relaxed">{rule}</span>
          </div>
        ))}
      </div>
      {role === 'teacher' ? (
        <button className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black hover:bg-emerald-700 w-full shadow-lg transition-transform hover:scale-[1.02] text-xl italic uppercase" onClick={nextScenario}>
          {btnText}
        </button>
      ) : (
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl text-center animate-pulse">
          <p className="font-black text-xl uppercase italic mb-1">Giảng viên đang phổ biến luật chơi</p>
          <p className="text-sm font-bold opacity-80 uppercase tracking-widest text-blue-100">Vui lòng lắng nghe hướng dẫn từ Giảng viên...</p>
        </div>
      )}
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-black uppercase tracking-[0.2em] animate-pulse">Neural Link Handshake...</p>
    </div>
  );

  if (!role) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <h3 className="text-3xl font-black text-slate-800 text-center mb-10 italic uppercase tracking-tighter border-b-4 border-slate-900 pb-2">CHỌN VAI TRÒ</h3>
        <button onClick={() => setRole('teacher')} className="w-full p-8 bg-white border-2 border-slate-200 rounded-[2rem] hover:border-blue-600 transition-all text-left shadow-lg group">
           <span className="block text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase">GIẢNG VIÊN</span>
           <span className="text-slate-400 text-sm font-bold italic">Điều khiển tiến trình & Quản lý sàn đấu.</span>
        </button>
        <button onClick={() => setRole('student')} className="w-full p-8 bg-white border-2 border-slate-200 rounded-[2rem] hover:border-emerald-600 transition-all text-left shadow-lg group">
           <span className="block text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors uppercase">SINH VIÊN</span>
           <span className="text-slate-400 text-sm font-bold italic">Gia nhập đội ngũ Marketer & Đấu giá.</span>
        </button>
      </div>
    );
  }

  if (role === 'student' && !isJoined) {
    return (
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl max-w-xl mx-auto animate-fade-up">
        <h3 className="text-3xl font-black text-slate-800 mb-2 italic uppercase">ĐĂNG KÝ BRAND</h3>
        <p className="text-slate-400 font-bold text-sm mb-10 uppercase tracking-widest">Dữ liệu của bạn sẽ được tự động khôi phục nếu lag.</p>
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Tên thương hiệu</label>
            <input type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-600 outline-none font-black text-xl" placeholder="NIKE / APPLE / ..." value={myBrandName} onChange={e => setMyBrandName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Archetype</label>
            <div className="grid grid-cols-2 gap-4">
              {['SneakerX', 'TechGadget', 'GlowBeauty', 'FitGear'].map(t => (
                <button key={t} onClick={() => setMyArchetype(t)} className={`p-5 rounded-[1.5rem] border-2 transition-all font-black text-xs uppercase tracking-widest ${myArchetype === t ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={joinGame} disabled={!myBrandName || !myArchetype} className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black text-xl shadow-xl hover:bg-black disabled:opacity-30 transition-all uppercase italic tracking-widest">
            VÀO SÀN ĐẤU →
          </button>
        </div>
      </div>
    );
  }

  const { currentScenario: scenario } = gameState;
  const isPlaying = !gameState.showPhase1Rules && !gameState.showPhase1Summary && !gameState.showPhase2Rules && !gameState.showFinalSummary && scenario;
  const playerCount = Object.keys(gameState.players).length;
  const submittedCount = Object.values(gameState.players).filter(p => p.submitted).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      {/* DISCONNECTED OVERLAY */}
      {isDisconnected && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl text-center shadow-2xl animate-bounce-in max-w-xs">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h4 className="text-xl font-black text-slate-800 uppercase italic">MẤT KẾT NỐI</h4>
            <p className="text-slate-500 text-sm font-bold mt-2">Đang cố gắng kết nối lại với Sàn đấu...</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-lg">
        <div className="flex items-center gap-5">
          <div className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black italic text-2xl rotate-3 shadow-xl">RTB</div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase italic leading-none">{role === 'teacher' ? 'COMMANDER' : myBrandName}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter border border-blue-100">
                {role === 'teacher' ? 'ADMIN' : archetypeLabels[myArchetype] || myArchetype}
              </span>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-tighter">{playerCount} MARKETERS</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {gameState.timeLeft > 0 && (
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Left</p>
              <span className={`text-3xl font-black tabular-nums leading-none ${gameState.timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>{gameState.timeLeft}s</span>
            </div>
          )}
          {role === 'teacher' && (
            <div className="flex gap-2">
              <button onClick={triggerRestartOnServer} className="px-4 py-3 text-[10px] font-black text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl uppercase italic border border-red-100">RESTART CLASS</button>
              <button onClick={nextScenario} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:scale-105 transition-all text-xs uppercase italic tracking-widest">
                {gameState.currentRoundIndex === -1 ? 'BẮT ĐẦU BUỔI HỌC' : 'TIẾP THEO →'}
              </button>
            </div>
          )}
          {role === 'student' && (
            <button onClick={restartSimulation} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">Leave Game</button>
          )}
        </div>
      </div>

      {gameState.showPhase1Rules && renderRules(
        "Giai đoạn 1: Miền Tây hoang dã", 
        "Cơ chế đấu giá Vickrey & Định giá dữ liệu", 
        [
          "Đấu giá Vickrey (Second-Price): Người trả giá cao nhất thắng, nhưng chỉ trả bằng [Giá cao thứ 2 + 0.01$]. Cơ chế này khuyến khích bạn đặt đúng 'Giá trị thực' (True Value) mà bạn cảm nhận về người dùng.",
          "Tránh Winner's Curse: Nếu bạn đặt giá thầu quá cao vượt quá giá trị chuyển đổi ($15), bạn sẽ bị lỗ ngay cả khi thắng cuộc. Hãy tính toán kỹ lợi nhuận biên.",
          "Cấu trúc Doanh thu: Nhận $15 nếu Archetype của bạn khớp 'Chính xác' với Intent của người dùng. Nhận $5 nếu 'Khớp mở rộng' (có liên quan gián tiếp). Nhận $0 nếu không liên quan.",
          "Dữ liệu người dùng: Trong giai đoạn này, bạn có đầy đủ thông tin về Tuổi, Hoạt động và Ý định mua sắm nhờ vào Cookie bên thứ ba. Hãy tận dụng tối đa dữ liệu này.",
          "Quản lý Ngân sách: Bạn bắt đầu với $50. Mỗi vòng có 33 giây để đặt thầu. Mục tiêu không phải là thắng nhiều nhất, mà là có Lợi nhuận ròng (Net Profit) cao nhất sau 12 vòng đấu."
        ], 
        "KÍCH HOẠT VÒNG 1"
      )}
      {gameState.showPhase1Summary && renderLeaderboardUI("Tổng kết Giai đoạn 1", "Phân tích hiệu quả quảng cáo (ROAS) trước khi bước vào kỷ nguyên bảo mật dữ liệu.", "TIẾP THEO: QUY TẮC GIAI ĐOẠN 2")}
      {gameState.showPhase2Rules && renderRules(
        "Giai đoạn 2: Sự trỗi dậy của Thuật toán", 
        "Kỷ nguyên Privacy & Nhắm mục tiêu Ngữ cảnh", 
        [
          "Kỷ nguyên Không Cookie: Apple và Google bắt đầu chặn dữ liệu theo dõi. Bạn sẽ thấy nhiều người dùng hiển thị là 'Ẩn' hoặc 'Không xác định' (N/A).",
          "Contextual Targeting (Nhắm mục tiêu ngữ cảnh): Khi dữ liệu cá nhân bị ẩn, bạn phải dựa vào 'Hoạt động hiện tại' (Trang web họ đang xem) để dự đoán nhu cầu của khách hàng.",
          "Chiến lược Thuật toán: Trong thực tế, tần suất đấu giá diễn ra hàng triệu lần/giây. Bạn cần xây dựng một 'Logic dự phòng' khi thông tin người dùng không rõ ràng.",
          "Rủi ro dữ liệu nhiễu: Nhiều profile người dùng sẽ trông giống nhau nhưng giá trị thực tế khác nhau. Hãy cẩn thận khi đặt thầu cao cho các profile thiếu minh bạch.",
          "Đua TOP cuối cùng: Đây là cơ hội để các đội bứt phá bằng cách tối ưu hóa giá thầu cho những tệp khách hàng 'ngách' nhưng có giá trị chuyển đổi cao."
        ], 
        "KÍCH HOẠT VÒNG 13"
      )}
      {gameState.showFinalSummary && renderLeaderboardUI("CHAMPIONS ARENA", "Final results. Glory to the data-driven!", "RESET CLASS")}

      {isPlaying && (
        <div className="space-y-8 animate-fade-up">
          <div className="bg-white p-10 rounded-[3rem] border-2 border-blue-50 shadow-xl relative overflow-hidden">
             <div className="absolute -top-10 -right-10 opacity-5 select-none"><span className="text-[15rem] font-black italic">#{scenario.round}</span></div>
             <span className="inline-block bg-slate-900 text-white font-black px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] mb-6 shadow-xl">ROUND {scenario.round} / {gameState.scenariosCount}</span>
             <p className="text-3xl text-slate-800 leading-tight font-black max-w-2xl mb-6 italic">Targeting: <span className="text-blue-600 underline">User #{scenario.userId}</span>, {scenario.age}y, actively <span className="text-slate-400">{scenario.activity}</span>.</p>
             <div className="inline-block bg-yellow-100 p-4 rounded-[1.5rem] border-b-8 border-yellow-400"><p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Predicted Intent</p><p className="text-2xl font-black text-slate-900 italic">"{scenario.intent}"</p></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] italic">Auction Floor</h4>
                {gameState.players[myBrandName]?.submitted && <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg animate-bounce">BID SECURED</span>}
              </div>
              {role === 'student' ? (
                <div className="flex gap-5">
                  <div className="relative flex-1 group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-3xl text-slate-300 group-focus-within:text-blue-600 transition-colors">$</span>
                    <input type="number" step="0.1" className="w-full p-8 pl-14 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-blue-600 outline-none text-4xl font-black tabular-nums transition-all shadow-inner" placeholder="0.00" value={myBid} onChange={e => setMyBid(e.target.value)} disabled={gameState.players[myBrandName]?.submitted || gameState.result} />
                  </div>
                  <button onClick={submitBid} disabled={gameState.players[myBrandName]?.submitted || !myBid || gameState.result} className="bg-slate-900 text-white px-12 rounded-[2rem] font-black text-2xl hover:bg-blue-600 disabled:opacity-30 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all uppercase italic">BID</button>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200">
                   <p className="text-slate-400 font-black mb-6 uppercase tracking-widest italic">Monitoring Live Market</p>
                   <div className="flex justify-center gap-4">
                    <button onClick={forceAuction} disabled={gameState.result} className="bg-red-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-black transition-all uppercase italic">FORCE AUCTION</button>
                    {gameState.result && <button onClick={nextScenario} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-black transition-all uppercase italic">NEXT ROUND →</button>}
                   </div>
                </div>
              )}
              <div className="mt-10 pt-10 border-t border-slate-100 flex justify-between items-center">
                <div className="flex -space-x-3 overflow-hidden">
                  {Object.entries(gameState.players).slice(0, 12).map(([name, p]) => (
                    <div key={name} className={`w-12 h-12 rounded-2xl border-4 border-white flex items-center justify-center font-black text-xs text-white shadow-xl rotate-${(name.length % 6) * 3} ${p.submitted ? 'bg-emerald-500' : 'bg-slate-200'}`}>{name.charAt(0).toUpperCase()}</div>
                  ))}
                  {playerCount > 12 && <div className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 shadow-xl">+{playerCount - 12}</div>}
                </div>
                <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Live Progress</p><p className="text-xl font-black text-slate-800"><span className="text-blue-600">{submittedCount}</span> / {playerCount} Ready</p></div>
              </div>
            </div>
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between relative overflow-hidden">
               <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-600 rounded-full opacity-10 blur-[100px]"></div>
               {role === 'student' ? (
                 <>
                   <div>
                     <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8 italic">Your Portfolio</h4>
                     <div className="mb-6 pb-6 border-b border-white/10">
                        <p className="text-[10px] font-black text-slate-500 uppercase leading-none mb-3">Product Category</p>
                        <p className="text-xl font-black text-white italic">{archetypeLabels[myArchetype]}</p>
                     </div>
                     <div className="mb-8"><p className="text-[10px] font-black text-slate-500 uppercase leading-none mb-3">Total Net Profit</p><p className={`text-5xl font-black tabular-nums italic ${gameState.players[myBrandName]?.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${gameState.players[myBrandName]?.profit.toFixed(2)}</p></div>
                     <div><p className="text-[10px] font-black text-slate-500 uppercase leading-none mb-3">Current Budget</p><p className="text-3xl font-black tabular-nums text-blue-400">${(50 + (gameState.players[myBrandName]?.profit || 0)).toFixed(2)}</p></div>
                   </div>
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mt-10 backdrop-blur-md"><p className="text-[10px] font-black text-blue-400 uppercase italic mb-2">Strategy Intelligence</p><p className="text-xs font-bold text-slate-300 leading-relaxed italic opacity-80">{scenario.round < 12 ? "Exact Match ($15) is your priority. Don't overbid!" : "Cookie blockage detected. Guess intent from user activity profile."}</p></div>
                 </>
               ) : (
                 <>
                   <div>
                     <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-10 italic">Live Top 5</h4>
                     <div className="space-y-4">
                        {sortedLeaderboard.slice(0, 5).map((p, i) => (
                          <div key={p.name} className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                              <span className="font-black text-slate-600 text-xs italic group-hover:text-blue-400">{i+1}</span>
                              <span className="font-bold text-sm uppercase tracking-tight">{p.name}</span>
                            </div>
                            <span className="font-black tabular-nums text-emerald-400 text-sm">${(50+p.profit).toFixed(2)}</span>
                          </div>
                        ))}
                        {playerCount === 0 && <p className="text-xs text-slate-500 italic">Waiting for brands to register...</p>}
                     </div>
                   </div>
                   <div className="mt-10 pt-10 border-t border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase italic">Command Note:</p>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">You can force the auction if some students are unresponsive to maintain class momentum.</p>
                   </div>
                 </>
               )}
            </div>
          </div>

          {gameState.result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white p-12 rounded-[4rem] border-8 border-emerald-500 text-center shadow-[0_40px_100px_-12px_rgba(16,185,129,0.3)] animate-bounce-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-emerald-500"></div>
                <h4 className="text-sm font-black text-emerald-600 uppercase tracking-[0.5em] mb-4 italic">Winner!</h4>
                <h2 className="text-6xl font-black text-slate-900 mb-4 italic tracking-tighter uppercase leading-none">"{gameState.result.winner}"</h2>
                <span className="inline-block bg-slate-100 px-6 py-2 rounded-full text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-12">{gameState.result.archetype} MARKET</span>
                <div className="grid grid-cols-2 gap-6 relative z-10">
                   <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 text-left"><p className="text-[10px] text-slate-400 font-black uppercase mb-2">Bid</p><p className="text-3xl font-black text-slate-800">${gameState.result.winningBid.toFixed(2)}</p></div>
                   <div className="bg-emerald-50 p-6 rounded-[2.5rem] border-2 border-emerald-100 text-left shadow-lg scale-105"><p className="text-[10px] text-emerald-600 font-black uppercase mb-2">Vickrey Price</p><p className="text-3xl font-black text-emerald-700">${gameState.result.pricePaid.toFixed(2)}</p></div>
                   <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 text-left"><p className="text-[10px] text-blue-600 font-black uppercase mb-2">Match</p><p className="text-2xl font-black text-blue-700 italic">{gameState.result.matchType}</p></div>
                   <div className={`p-6 rounded-[2.5rem] border-2 text-left ${gameState.result.profit >= 0 ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}><p className="text-[10px] text-slate-500 font-black uppercase mb-2">Net Profit</p><p className={`text-3xl font-black ${gameState.result.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>${gameState.result.profit.toFixed(2)}</p></div>
                </div>
              </div>
              <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl text-white">
                <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] mb-10 italic">Current Top Performers</h4>
                <div className="space-y-4">
                  {sortedLeaderboard.slice(0, 5).map((p, i) => (
                    <div key={p.name} className={`flex justify-between items-center p-5 rounded-[2rem] border-2 transition-all ${i === 0 ? 'bg-white/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-5"><span className={`text-2xl font-black italic ${i === 0 ? 'text-blue-400' : 'text-slate-600'}`}>{i + 1}</span><span className="font-black text-xl italic uppercase tracking-tighter">{p.name}</span></div>
                      <span className="font-black text-2xl italic tabular-nums text-emerald-400">${p.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState.currentRoundIndex === -1 && !gameState.showPhase1Rules && (
        <div className="text-center py-24 bg-white rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_2px,transparent_1px)] [background-size:30px_30px]"></div>
          <h2 className="text-8xl font-black text-slate-900 mb-6 italic tracking-tighter leading-none uppercase">RTB ARENA</h2>
          <p className="text-slate-400 font-black max-w-md mx-auto mb-16 uppercase tracking-[0.5em] italic opacity-60">Global Ad Exchange Simulator</p>
          <div className="max-w-2xl mx-auto grid grid-cols-3 gap-6 mb-16 relative z-10 px-10">
             <div className="p-8 bg-slate-50 rounded-[2.5rem] shadow-inner border border-slate-100"><p className="text-4xl font-black text-slate-900 mb-2">{playerCount}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Registered</p></div>
             <div className="p-8 bg-slate-50 rounded-[2.5rem] shadow-inner border border-slate-100"><p className="text-4xl font-black text-slate-900 mb-2">33s</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Bidding Window</p></div>
             <div className="p-8 bg-slate-50 rounded-[2.5rem] shadow-inner border border-slate-100"><p className="text-4xl font-black text-slate-900 mb-2">27</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Match Rounds</p></div>
          </div>
          <div className="text-center">
            {role === 'student' ? (
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                <span className="text-sm font-black text-blue-600 bg-blue-50 px-8 py-4 rounded-full uppercase tracking-[0.4em] italic shadow-lg">WAITING FOR COMMANDER...</span>
              </div>
            ) : (
              <p className="text-slate-400 font-black italic uppercase tracking-widest animate-bounce">Commander! Initiate phase protocols when ready.</p>
            )}
          </div>
        </div>
      )}

      {/* ERROR FALLBACK */}
      {gameState.currentRoundIndex >= 0 && !gameState.showPhase1Rules && !gameState.showPhase1Summary && !gameState.showPhase2Rules && !gameState.showFinalSummary && !scenario && (
        <div className="text-center py-20 bg-red-50 border-2 border-red-200 rounded-[3rem]">
          <h3 className="text-2xl font-black text-red-600 mb-4">CRITICAL DATA ERROR</h3>
          <p className="text-red-500 font-bold mb-8">The backend failed to provide the user profile for Round {gameState.currentRoundIndex + 1}.</p>
          {role === 'teacher' && <button onClick={triggerRestartOnServer} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase italic">RESTART SERVER STATE</button>}
        </div>
      )}
    </div>
  )
}
