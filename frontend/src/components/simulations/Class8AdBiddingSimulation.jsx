import { useState, useEffect, useRef } from 'react'

export default function Class8AdBiddingSimulation({ apiBaseUrl }) {
  const [role, setRole] = useState(null); // 'teacher' or 'student'
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myBid, setMyBid] = useState('');
  
  // Shared State from Server
  const [gameState, setGameState] = useState({
    currentRoundIndex: -1,
    bids: { SneakerX: 0, TechGadget: 0, GlowBeauty: 0, FitGear: 0 },
    submittedBids: { SneakerX: false, TechGadget: false, GlowBeauty: false, FitGear: false },
    profits: { SneakerX: 0, TechGadget: 0, GlowBeauty: 0, FitGear: 0 },
    result: null,
    showPhase1Rules: false,
    showPhase1Summary: false,
    showPhase2Rules: false,
    showFinalSummary: false,
    scenariosCount: 0,
    currentScenario: null
  });

  const socketRef = useRef(null);

  useEffect(() => {
    const wsUrl = apiBaseUrl.replace('http', 'ws') + '/api/simulations/lesson-8-sync/ws';
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Connected to simulation server');
      setLoading(false);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'STATE_UPDATE') {
        setGameState(message.payload);
      } else if (message.type === 'TIMER_TICK') {
        setGameState(prev => ({ ...prev, timeLeft: message.payload.timeLeft }));
      } else if (message.type === 'ERROR') {
        alert("Server Error: " + message.payload);
      }
    };

    return () => {
      socket.close();
    };
  }, [apiBaseUrl]);

  const sendAction = (type, payload = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
    }
  };

  const submitBid = () => {
    if (!myTeam) return;
    sendAction('SUBMIT_BID', { team: myTeam, amount: parseFloat(myBid) || 0 });
    setMyBid('');
  };

  const nextScenario = () => sendAction('NEXT_PHASE');
  const restartSimulation = () => sendAction('RESTART');
  const forceAuction = () => sendAction('FORCE_AUCTION');

  const renderLeaderboard = (title, description, btnText) => {
    const sortedTeams = Object.keys(gameState.profits).map(team => ({
      team,
      profit: gameState.profits[team],
      total: 50 + gameState.profits[team]
    })).sort((a, b) => b.total - a.total);

    return (
      <div className="bg-white p-6 rounded-2xl border border-blue-200 text-center shadow-md animate-fade-up max-w-2xl mx-auto">
        <h4 className="text-2xl font-bold text-slate-800 mb-2">🏆 {title}</h4>
        <p className="text-slate-600 mb-6">{description}</p>
        <div className="space-y-3">
          {sortedTeams.map((t, index) => (
            <div key={t.team} className={`flex justify-between items-center p-4 rounded-xl border ${index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${index === 0 ? 'text-yellow-600' : 'text-slate-500'}`}>#{index + 1}</span>
                <span className="font-semibold text-slate-800">{t.team}</span>
              </div>
              <div className="text-right">
                <p className={`font-bold ${t.total >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>${t.total.toFixed(2)}</p>
                <p className="text-xs text-slate-400">Lợi nhuận: ${t.profit.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        {role === 'teacher' && (
          <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-blue-700 w-full" onClick={nextScenario}>
            {btnText}
          </button>
        )}
      </div>
    );
  };

  const renderRules = (title, subtitle, rules, btnText) => (
    <div className="bg-white p-8 rounded-2xl border border-blue-200 text-center shadow-md animate-fade-up max-w-3xl mx-auto">
      <h4 className="text-3xl font-bold text-slate-800 mb-2">{title}</h4>
      <p className="text-lg text-blue-600 font-semibold mb-8">{subtitle}</p>
      <div className="text-left space-y-4 text-slate-700 bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
        {rules.map((rule, idx) => (
          <p key={idx} className="flex gap-3 items-start"><span className="text-blue-500 font-bold">•</span><span>{rule}</span></p>
        ))}
      </div>
      {role === 'teacher' ? (
        <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 w-full" onClick={nextScenario}>
          {btnText}
        </button>
      ) : (
        <div className="bg-blue-50 p-4 rounded-xl text-blue-700 font-medium">Đang chờ giảng viên bắt đầu...</div>
      )}
    </div>
  );

  if (loading) return <div className="text-center py-12 text-slate-500">Đang kết nối đến máy chủ mô phỏng...</div>;

  if (!role) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <h3 className="text-2xl font-bold text-slate-800 text-center mb-8">Bạn là ai?</h3>
        <button onClick={() => setRole('teacher')} className="w-full p-6 bg-white border-2 border-blue-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
           <span className="block text-xl font-bold text-slate-800">Giảng viên / Quản trò</span>
           <span className="text-slate-500 text-sm">Điều khiển tiến trình và xem kết quả chung.</span>
        </button>
        <button onClick={() => setRole('student')} className="w-full p-6 bg-white border-2 border-emerald-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left">
           <span className="block text-xl font-bold text-slate-800">Sinh viên / Người chơi</span>
           <span className="text-slate-500 text-sm">Chọn đội và tham gia đặt giá thầu.</span>
        </button>
      </div>
    );
  }

  if (role === 'student' && !myTeam) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-blue-200 text-center shadow-md max-w-xl mx-auto">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Chọn đội của bạn</h3>
        <div className="grid grid-cols-2 gap-4">
          {['SneakerX', 'TechGadget', 'GlowBeauty', 'FitGear'].map(t => (
            <button key={t} onClick={() => setMyTeam(t)} className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 font-bold">
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const { currentScenario: scenario } = gameState;
  const isPlaying = !gameState.showPhase1Rules && !gameState.showPhase1Summary && !gameState.showPhase2Rules && !gameState.showFinalSummary && scenario;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800">RTB Arena: {role === 'teacher' ? 'Control Panel' : `Team ${myTeam}`}</h3>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-400">Status: {isPlaying ? `Round ${scenario.round}` : 'In Menu'}</p>
            {gameState.timeLeft > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gameState.timeLeft < 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
                ⏱ {gameState.timeLeft}s
              </span>
            )}
          </div>
        </div>
        {role === 'teacher' && (
          <div className="flex gap-2">
            <button onClick={restartSimulation} className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg">Reset Game</button>
            <button onClick={nextScenario} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
              {gameState.currentRoundIndex === -1 ? 'Bắt đầu' : 'Tiếp theo'}
            </button>
          </div>
        )}
      </div>

      {gameState.showPhase1Rules && renderRules(
        "Giai đoạn 1: Miền Tây hoang dã", 
        "Vòng 1 - 12: Đấu giá thủ công", 
        [
          "Bạn đại diện cho một trong 4 thương hiệu: SneakerX, TechGadget, GlowBeauty, hoặc FitGear.",
          "Ngân sách ban đầu: $50.00. Mục tiêu là tối đa hóa lợi nhuận ròng (Doanh thu - Chi phí).",
          "Cơ chế đấu giá Vickrey: Người trả giá cao nhất thắng, nhưng chỉ trả bằng [Giá cao thứ 2 + $0.01]. Đừng bao giờ 'overbid' (trả giá cao hơn giá trị thực)!",
          "Doanh thu: Khớp chính xác (Exact Match) = $15 | Khớp mở rộng (Broad Match) = $5 | Không khớp = $0.",
          "Thời gian: Bạn có 90 giây để đặt giá. Nếu hết thời gian, giá thầu mặc định là $0."
        ], 
        "Bắt đầu Giai đoạn 1"
      )}
      {gameState.showPhase1Summary && renderLeaderboard("Tổng kết Giai đoạn 1", "Kết thúc Vòng 12. Hãy xem ai đang tối ưu hóa ROAS tốt nhất!", "Tiếp theo: Giai đoạn 2")}
      {gameState.showPhase2Rules && renderRules(
        "Giai đoạn 2: Sự trỗi dậy của Thuật toán", 
        "Vòng 13 - 27: Biến động thị trường", 
        [
          "Thị trường thay đổi: Lưu lượng truy cập tăng vọt, nhưng quyền riêng tư (Cookie block) bắt đầu xuất hiện.",
          "Thông tin bị ẩn: Nhiều người dùng sẽ hiển thị là 'Ẩn' hoặc 'Không xác định' do các chính sách bảo mật.",
          "Nhắm mục tiêu ngữ cảnh (Contextual Targeting): Bạn phải đoán ý định người dùng dựa trên trang web họ đang xem thay vì dữ liệu cá nhân.",
          "Thuật toán: Trong thực tế, máy tính sẽ thay bạn đặt giá. Hãy bám sát chiến lược bảo toàn ngân sách cho các cơ hội vàng."
        ], 
        "Bắt đầu Giai đoạn 2"
      )}
      {gameState.showFinalSummary && renderLeaderboard("Bảng xếp hạng chung cuộc", "Mô phỏng hoàn tất! Chúc mừng các đội đã tối ưu hóa ngân sách thành công.", "Chơi lại")}

      {isPlaying && (
        <div className="space-y-6 animate-fade-up">
          <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
             <span className="inline-block bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs mb-3">ROUND {scenario.round} / {gameState.scenariosCount}</span>
             <p className="text-xl text-slate-700 leading-relaxed font-medium">
               User <span className="text-blue-600">#{scenario.userId}</span>, {scenario.age} tuổi, đang <span className="italic">{scenario.activity}</span>. 
               Ý định: <span className="bg-yellow-100 px-1">"{scenario.intent}"</span>
             </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(gameState.bids).map(team => (
              <div key={team} className={`p-4 rounded-xl border-2 transition-all ${gameState.submittedBids[team] ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-slate-800">{team}</span>
                  {gameState.submittedBids[team] && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">READY</span>}
                </div>
                {role === 'student' && team === myTeam ? (
                  <div className="space-y-2">
                    <input type="number" step="0.1" className="w-full p-2 border rounded-lg focus:ring-2 ring-blue-500 outline-none" placeholder="Bid $" value={myBid} onChange={e => setMyBid(e.target.value)} disabled={gameState.submittedBids[team]} />
                    <button onClick={submitBid} disabled={gameState.submittedBids[team] || !myBid} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm disabled:opacity-30">Gửi giá</button>
                  </div>
                ) : (
                  <div className="h-16 flex items-center justify-center">
                    {gameState.submittedBids[team] ? <span className="text-emerald-600 font-bold">✓ Đã đặt</span> : <span className="text-slate-300 text-sm italic">Đang chờ...</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {role === 'teacher' && !gameState.result && (
            <div className="text-center bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
               <p className="text-slate-500 mb-4">Giảng viên có thể ép buộc thực hiện đấu giá nếu một số sinh viên không tham gia.</p>
               <button onClick={forceAuction} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all">THỰC HIỆN ĐẤU GIÁ</button>
            </div>
          )}

          {gameState.result && (
            <div className="bg-white p-8 rounded-3xl border-4 border-emerald-500 text-center shadow-2xl animate-bounce-in">
              <h4 className="text-3xl font-black text-slate-800 mb-6">🎉 {gameState.result.winner} THẮNG!</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-400 font-bold">BID</p><p className="font-bold">${gameState.result.winningBid.toFixed(2)}</p></div>
                 <div className="p-3 bg-emerald-50 rounded-xl"><p className="text-[10px] text-emerald-600 font-bold">PRICE PAID</p><p className="font-bold text-emerald-700">${gameState.result.pricePaid.toFixed(2)}</p></div>
                 <div className="p-3 bg-blue-50 rounded-xl"><p className="text-[10px] text-blue-600 font-bold">TYPE</p><p className="font-bold text-blue-700">{gameState.result.matchType}</p></div>
                 <div className={`p-3 rounded-xl ${gameState.result.profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}><p className="text-[10px] text-slate-500 font-bold">PROFIT</p><p className={`font-black ${gameState.result.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>${gameState.result.profit.toFixed(2)}</p></div>
              </div>
              {role === 'teacher' && <button onClick={nextScenario} className="mt-8 bg-slate-800 text-white px-10 py-3 rounded-2xl font-black">VÒNG TIẾP THEO →</button>}
            </div>
          )}
        </div>
      )}

      {gameState.currentRoundIndex === -1 && !gameState.showPhase1Rules && (
        <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-100 max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black text-slate-800 mb-6 italic">RTB ARENA: THE AD WARS</h2>
          <div className="text-left space-y-4 mb-10 bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="font-bold text-blue-800 flex items-center gap-2 text-lg">🚀 Tổng quan trò chơi:</h4>
            <p className="text-slate-700 leading-relaxed font-medium">
              Chào mừng đến với sàn đấu giả lập RTB (Real-Time Bidding). Bạn sẽ đóng vai trò là chuyên gia Digital Marketing, cạnh tranh trực tiếp với các bạn cùng lớp để mua vị trí quảng cáo cho thương hiệu của mình.
            </p>
            <ul className="text-slate-600 space-y-3 list-disc ml-5 font-medium">
              <li>Mỗi vòng đấu có 90 giây để suy nghĩ, định giá và đặt thầu.</li>
              <li>Dựa trên hồ sơ người dùng để quyết định giá trị của lượt hiển thị.</li>
              <li>Chiến thắng bằng cách tối ưu hóa Lợi nhuận ròng, không chỉ là thắng đấu giá.</li>
            </ul>
          </div>
          {role === 'student' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-emerald-600 font-black animate-pulse bg-emerald-50 py-4 rounded-xl border border-emerald-200">
                 <span className="text-2xl">🎮</span> ĐÃ SẴN SÀNG - ĐANG CHỜ GIẢNG VIÊN BẮT ĐẦU...
              </div>
              <p className="text-xs text-slate-400 font-medium italic">Chuẩn bị tinh thần cho cuộc chiến thuật toán!</p>
            </div>
          ) : (
            <div className="space-y-4">
               <p className="text-slate-500 font-bold mb-4">Mọi thứ đã sẵn sàng. Nhấp "Bắt đầu" để phổ biến luật chơi cho cả lớp.</p>
               <button onClick={nextScenario} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all text-xl">BẮT ĐẦU BUỔI HỌC</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
