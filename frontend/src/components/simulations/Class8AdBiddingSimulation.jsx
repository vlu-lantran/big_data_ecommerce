import { useState, useEffect } from 'react'

export default function Class8AdBiddingSimulation({ apiBaseUrl }) {
  const [scenarios, setScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  
  const [currentRoundIndex, setCurrentRoundIndex] = useState(-1);
  const [bids, setBids] = useState({
    SneakerX: '',
    TechGadget: '',
    GlowBeauty: '',
    FitGear: ''
  });
  const [result, setResult] = useState(null);
  
  const [profits, setProfits] = useState({
    SneakerX: 0,
    TechGadget: 0,
    GlowBeauty: 0,
    FitGear: 0
  });

  const [showPhase1Rules, setShowPhase1Rules] = useState(false);
  const [showPhase1Summary, setShowPhase1Summary] = useState(false);
  const [showPhase2Rules, setShowPhase2Rules] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  useEffect(() => {
    fetch(`${apiBaseUrl}/mock_gcs_bucket/classes/lesson-8-lab-web-advertising/scenarios.json`)
      .then(res => res.json())
      .then(data => {
        setScenarios(data);
        setLoadingScenarios(false);
      })
      .catch(err => {
        console.error("Failed to load scenarios:", err);
        setLoadingScenarios(false);
      });
  }, [apiBaseUrl]);

  const scenario = currentRoundIndex >= 0 && currentRoundIndex < scenarios.length ? scenarios[currentRoundIndex] : null;

  const restartSimulation = () => {
    setCurrentRoundIndex(-1);
    setResult(null);
    setProfits({ SneakerX: 0, TechGadget: 0, GlowBeauty: 0, FitGear: 0 });
    setShowPhase1Rules(false);
    setShowPhase1Summary(false);
    setShowPhase2Rules(false);
    setShowFinalSummary(false);
    setBids({ SneakerX: '', TechGadget: '', GlowBeauty: '', FitGear: '' });
  };

  const nextScenario = () => {
    if (currentRoundIndex === -1 && !showPhase1Rules) {
      setShowPhase1Rules(true);
      return;
    }
    
    if (showPhase1Rules) {
      setShowPhase1Rules(false);
      setCurrentRoundIndex(0);
      setBids({ SneakerX: '', TechGadget: '', GlowBeauty: '', FitGear: '' });
      return;
    }

    if (showPhase1Summary) {
      setShowPhase1Summary(false);
      setShowPhase2Rules(true);
      return;
    }

    if (showPhase2Rules) {
      setShowPhase2Rules(false);
      setCurrentRoundIndex(12);
      setBids({ SneakerX: '', TechGadget: '', GlowBeauty: '', FitGear: '' });
      return;
    }

    if (showFinalSummary) {
      restartSimulation();
      return;
    }

    if (currentRoundIndex === 11) {
      setShowPhase1Summary(true);
      setResult(null);
      return;
    }

    if (currentRoundIndex === scenarios.length - 1) {
      setShowFinalSummary(true);
      setResult(null);
      return;
    }

    setCurrentRoundIndex(prev => prev + 1);
    setResult(null);
    setBids({ SneakerX: '', TechGadget: '', GlowBeauty: '', FitGear: '' });
  };

  const executeAuction = () => {
    const teams = Object.keys(bids);
    const parsedBids = teams.map(team => ({
      team,
      amount: parseFloat(bids[team]) || 0
    })).sort((a, b) => b.amount - a.amount);

    const winner = parsedBids[0];
    const secondHighest = parsedBids[1];

    let pricePaid = 0;
    if (secondHighest && secondHighest.amount > 0) {
      pricePaid = secondHighest.amount + 0.01;
    } else {
      pricePaid = 0.01;
    }
    
    pricePaid = Math.min(pricePaid, winner.amount);
    
    let matchType = 'Trượt';
    let revenue = 0;
    
    if (scenario.exact.includes(winner.team) || scenario.exact === 'ALL TEAMS') {
      matchType = 'Khớp chính xác';
      revenue = 15;
    } else if (scenario.broad.includes(winner.team) || scenario.broad === 'ALL TEAMS') {
      matchType = 'Khớp mở rộng';
      revenue = 5;
    }

    const netProfit = revenue - pricePaid;

    setProfits(prev => ({
      ...prev,
      [winner.team]: prev[winner.team] + netProfit
    }));

    setResult({
      winner: winner.team,
      winningBid: winner.amount,
      pricePaid: pricePaid,
      matchType,
      revenue,
      profit: netProfit
    });
  };

  const renderLeaderboard = (title, description, btnText) => {
    const sortedTeams = Object.keys(profits).map(team => ({
      team,
      profit: profits[team],
      total: 50 + profits[team] // $50 starting budget
    })).sort((a, b) => b.total - a.total);

    return (
      <div className="bg-white p-6 rounded-2xl border border-blue-200 text-center shadow-md animate-fade-up">
        <h4 className="text-2xl font-bold text-slate-800 mb-2">🏆 {title}</h4>
        <p className="text-slate-600 mb-6">{description}</p>
        
        <div className="space-y-4 max-w-lg mx-auto">
          {sortedTeams.map((t, index) => (
            <div key={t.team} className={`flex justify-between items-center p-4 rounded-xl border ${index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <span className={`font-bold text-lg ${index === 0 ? 'text-yellow-600' : 'text-slate-500'}`}>#{index + 1}</span>
                <span className="font-semibold text-slate-800">{t.team}</span>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${t.total >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>${t.total.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Lợi nhuận ròng: {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors" 
          onClick={nextScenario}
        >
          {btnText}
        </button>
      </div>
    );
  };

  const renderRules = (title, subtitle, rules, btnText) => {
    return (
      <div className="bg-white p-8 rounded-2xl border border-blue-200 text-center shadow-md animate-fade-up max-w-3xl mx-auto">
        <h4 className="text-3xl font-bold text-slate-800 mb-2">{title}</h4>
        <p className="text-lg text-blue-600 font-semibold mb-8">{subtitle}</p>
        
        <div className="text-left space-y-4 text-slate-700 bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
          {rules.map((rule, idx) => (
            <p key={idx} className="flex gap-3 items-start">
              <span className="text-blue-500 font-bold">•</span>
              <span>{rule}</span>
            </p>
          ))}
        </div>

        <button 
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-emerald-700 transition-colors text-lg w-full sm:w-auto" 
          onClick={nextScenario}
        >
          {btnText}
        </button>
      </div>
    );
  };

  if (loadingScenarios) {
    return <div className="text-center py-12 text-slate-500">Đang tải dữ liệu mô phỏng...</div>;
  }

  const isPlaying = !showPhase1Rules && !showPhase1Summary && !showPhase2Rules && !showFinalSummary && scenario;

  const btnDisabled = currentRoundIndex >= scenarios.length || showPhase1Rules || showPhase1Summary || showPhase2Rules || showFinalSummary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h3 className="text-xl font-semibold text-slate-800">Mô phỏng RTB: Cuộc chiến đặt giá thầu</h3>
        {!btnDisabled && (
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50" 
            onClick={nextScenario} 
          >
            {currentRoundIndex === -1 ? 'Bắt đầu mô phỏng' : 'Tình huống tiếp theo'}
          </button>
        )}
      </div>

      {showPhase1Rules && renderRules(
        "Giai đoạn 1: Miền Tây hoang dã",
        "Vòng 1 - 12",
        [
          "Bạn đại diện cho một trong 4 thương hiệu thương mại điện tử: SneakerX, TechGadget, GlowBeauty, hoặc FitGear.",
          "Bạn bắt đầu với ngân sách $50.00.",
          "Tôi sẽ trình bày hồ sơ người dùng (tuổi, hoạt động hiện tại, mối quan tâm). Bạn sẽ đặt giá thầu ẩn danh cho quảng cáo hiển thị.",
          "Người trả giá cao nhất sẽ giành được vị trí quảng cáo và trả NHIỀU HƠN MỘT CENT so với mức giá cao thứ hai (Đấu giá Vickrey).",
          "Thanh toán: Khớp chính xác = $15 | Khớp mở rộng = $5 | Trượt = $0.",
          "Mục tiêu là tối đa hóa Lợi nhuận ròng (Doanh thu - Chi phí), không chỉ là thắng cuộc đấu giá. Đừng làm cạn kiệt ngân sách của bạn cho những người dùng giá trị thấp!"
        ],
        "Bắt đầu Vòng 1"
      )}

      {showPhase1Summary && renderLeaderboard(
        "Tổng kết Giai đoạn 1: Miền Tây hoang dã", 
        "Kết thúc Vòng 12. Hãy xem ai đang tối đa hóa ROAS của họ trước khi các thuật toán tiếp quản!",
        "Tiếp theo: Quy tắc Giai đoạn 2"
      )}

      {showPhase2Rules && renderRules(
        "Giai đoạn 2: Sự chuyển đổi thuật toán",
        "Vòng 13 - 27",
        [
          "Giai đoạn đặt giá thầu thủ công đã kết thúc. Trong thế giới thực, các thuật toán sẽ đặt giá thầu cho bạn.",
          "Lưu lượng truy cập sẽ tăng vọt, và các khối quyền riêng tư sẽ xảy ra.",
          "Bạn phải bám sát chiến lược của mình. Logic dự phòng kém sẽ làm lãng phí tiền của bạn rất nhanh.",
          "Quy tắc vẫn như cũ: Người trả giá cao nhất sẽ thắng, trả cao hơn 1 cent so với vị trí thứ 2.",
          "Bảo toàn ngân sách của bạn cho các mục tiêu giá trị cao."
        ],
        "Bắt đầu Vòng 13"
      )}
      
      {showFinalSummary && renderLeaderboard(
        "Bảng xếp hạng chung cuộc", 
        "Mô phỏng đã hoàn tất! Đây là số dư cuối cùng của tất cả các đội.",
        "Khởi động lại mô phỏng"
      )}

      {isPlaying && (
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 backdrop-blur-sm shadow-sm animate-fade-up">
          <div className="mb-6">
             <span className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm mb-4">Vòng {scenario.round} / 27</span>
             <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
               <p className="text-lg text-slate-700 leading-relaxed">
                 Người dùng ID <span className="font-bold text-slate-800">#{scenario.userId}</span>, <span className="font-bold text-slate-800">{scenario.age}</span> tuổi. Đang <span className="font-bold text-slate-800">{scenario.activity}</span>. Mối quan tâm được dự đoán: <span className="font-bold text-blue-700">'{scenario.intent}'</span>.
               </p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.keys(bids).map(team => (
              <div key={team} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-lg mb-2">{team}</p>
                </div>
                <input 
                  type="number" 
                  step="0.01" 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none mt-2" 
                  placeholder="$ Giá thầu" 
                  value={bids[team]} 
                  onChange={e => setBids({...bids, [team]: e.target.value})} 
                />
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-sm text-slate-500 italic max-w-lg">Ghi chú của Game Master: {scenario.notes}</p>
            <button 
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-full font-medium shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 w-full md:w-auto" 
              onClick={executeAuction} 
              disabled={Object.values(bids).every(b => !b)}
            >
              Thực hiện đấu giá
            </button>
          </div>
        </div>
      )}

      {isPlaying && result && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 text-center shadow-md animate-fade-up">
          <h4 className="text-2xl font-bold text-slate-800 mb-2">🎉 {result.winner} Chiến thắng!</h4>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch mt-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1">
               <p className="text-sm text-slate-500 uppercase font-semibold mb-1">Giá thầu chiến thắng</p>
               <p className="text-xl font-bold text-slate-800">${result.winningBid.toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex-1">
               <p className="text-sm text-emerald-600 uppercase font-semibold mb-1">Giá phải trả (Giá thứ 2)</p>
               <p className="text-xl font-bold text-emerald-800">${result.pricePaid.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch mt-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex-1">
               <p className="text-sm text-blue-600 uppercase font-semibold mb-1">Loại khớp</p>
               <p className="text-xl font-bold text-blue-800">{result.matchType}</p>
               <p className="text-sm text-blue-600 mt-1">Doanh thu: ${result.revenue.toFixed(2)}</p>
            </div>
            <div className={`p-4 rounded-xl border flex-1 ${result.profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
               <p className={`text-sm uppercase font-semibold mb-1 ${result.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Lợi nhuận ròng</p>
               <p className={`text-2xl font-bold ${result.profit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                 ${result.profit.toFixed(2)}
               </p>
            </div>
          </div>
        </div>
      )}
      
      {!scenario && currentRoundIndex === -1 && !showPhase1Rules && (
         <div className="text-center text-slate-500 py-12 bg-white/50 rounded-2xl border border-dashed border-slate-300 shadow-sm">
           <p className="text-lg mb-2">Chào mừng đến với Đấu trường RTB.</p>
           <p className="text-sm">Nhấp vào <span className="font-semibold text-slate-600">"Bắt đầu mô phỏng"</span> để bắt đầu.</p>
         </div>
      )}
    </div>
  )
}
