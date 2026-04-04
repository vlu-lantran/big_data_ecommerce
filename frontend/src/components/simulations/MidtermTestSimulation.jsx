import { useState, useEffect } from 'react';

// Seeded PRNG
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

const CONCEPTS = [
  "A. Volume (3Vs)", "B. Velocity (3Vs)", "C. Variety (3Vs)", "D. Horizontal Scaling", "E. Vertical Scaling",
  "F. Distributed File System (DFS)", "G. Apache Spark (In-Memory Processing)", "H. Map-Reduce (Disk-Based Batch Processing)", "I. Bonferroni Principle",
  "J. K-Means Clustering", "K. Hierarchical Clustering", "L. Curse of Dimensionality",
  "M. Content-Based Filtering", "N. Collaborative Filtering", "O. Cold Start Strategy",
  "P. General SEO Practices", "Q. PageRank Algorithm", "R. Crawl Budget", "S. Internal Linking", "T. Bad Neighborhood / Link Spam"
];

const P1_SCENARIOS = [
  { answer: "B", text: "Xử lý hàng nghìn lượt quẹt thẻ tín dụng và điều chỉnh số lượng hàng tồn kho mỗi mili-giây trong đợt flash sale Black Friday." },
  { answer: "C", text: "Pipeline data lake ingestion bị sập vì đột nhiên nhận được một hỗn hợp các bảng SQL có cấu trúc (structured), hình ảnh JPEG phi cấu trúc (unstructured) và các đánh giá bằng văn bản thô (raw text)." },
  { answer: "A", text: "Một nhà bán lẻ quần áo nhận ra rằng database cũ của họ không thể chứa nổi 10 petabyte dữ liệu clickstream lịch sử được tạo ra trong 5 năm qua." },
  { answer: "D", text: "Để xử lý đợt cao điểm mua sắm, đội DevOps thêm 50 máy chủ web tương đối rẻ tiền mới vào cluster hiện tại để chia sẻ tải lượng truy cập." },
  { answer: "E", text: "Nâng cấp máy chủ database trung tâm duy nhất bằng cách thay thế 128GB RAM bằng 512GB RAM để xử lý các truy vấn lớn hơn." },
  { answer: "F", text: "Chia một file log máy chủ khổng lồ 500GB thành các khối (chunks) 128MB và phân tán các khối đó trên 10 ổ cứng vật lý khác nhau để lưu trữ." },
  { answer: "G", text: "Một chuyên viên phân tích từ bỏ Excel vì nó bị treo ở 1 triệu dòng, chuyển sang một framework hiện đại phân phối dataframe hoàn toàn trên RAM của một cluster để tránh việc đọc ổ cứng chậm." },
  { answer: "H", text: "Một data pipeline cũ đọc từ ổ đĩa, xử lý một lô dữ liệu (batch), ghi kết quả trung gian trở lại ổ cứng và lặp lại quá trình chậm chạp này trong nhiều giờ." },
  { answer: "I", text: "Một đội ngũ dữ liệu gắn cờ 50,000 người mua sắm bình thường là 'kẻ gian lận' vì thuật toán của họ tìm kiếm quá nhiều điểm trùng lặp ngẫu nhiên trong hành vi đến mức tìm thấy các 'mô hình' thống kê thực chất chỉ là sự ngẫu nhiên." },
  { answer: "B", text: "Một dashboard thời gian thực (real-time) cập nhật logistics giao hàng kho bãi vào đúng thời điểm một chiếc xe tải giao hàng đi qua một trạm kiểm soát GPS." },
  { answer: "C", text: "Cố gắng kết hợp (join) một relational database nghiêm ngặt chứa hồ sơ người dùng với một luồng emoji và tiếng lóng lộn xộn từ TikTok social listening API." },
  { answer: "A", text: "Nhận ra rằng việc lưu trữ mọi chuyển động chuột của mọi người dùng trên trang web của bạn sẽ yêu cầu chuyển đổi từ lưu trữ hàng megabyte sang hàng terabyte mỗi ngày." },
  { answer: "D", text: "Lưu lượng truy cập e-commerce giảm vào tháng Giêng, vì vậy nhà cung cấp cloud tự động tắt 20 máy ảo (virtual machines) dư thừa để tiết kiệm chi phí mà không làm trang web ngừng hoạt động." },
  { answer: "E", text: "Mua bộ vi xử lý top-tier đắt tiền nhất từ Intel để thay thế CPU cũ trong máy chủ backend duy nhất của bạn." },
  { answer: "F", text: "Một máy chủ bị bốc cháy, nhưng hệ thống vẫn trực tuyến (online) và không mất dữ liệu nào vì các khối dữ liệu đã được tự động nhân bản (replicated) qua 3 node khác ngay lúc ingestion." },
  { answer: "G", text: "Sử dụng một công cụ thực thi hiện đại để chạy các mô hình machine learning theo thời gian thực vì nó cache dữ liệu làm việc trên RAM thay vì phụ thuộc vào thao tác I/O ổ đĩa." },
  { answer: "H", text: "Sử dụng framework Hadoop để xử lý các file log khi tốc độ không phải là vấn đề, nhưng yêu cầu khả năng chịu lỗi (fault tolerance) cực cao trong quá trình ghi dữ liệu vào ổ đĩa chậm và tuần tự." },
  { answer: "I", text: "Tính toán xác suất của các sự kiện hiếm khi xảy ra cùng nhau để chứng minh cho giám đốc marketing rằng 'insight' mới của cô ấy về mặt toán học là vô dụng do kích thước mẫu (sample size) quá lớn." },
  { answer: "D", text: "Triết lý cốt lõi của 'The Technology of Scale': Thay vì mua một siêu máy tính, Shopee sử dụng hàng ngàn máy tính tiêu chuẩn làm việc cùng nhau." },
  { answer: "G", text: "Sử dụng DataFrames trong một môi trường phân tán (distributed environment) để thực thi một truy vấn nhanh hơn 100 lần so với các hệ thống Hadoop cũ." },
  { answer: "H", text: "Một batch job hàng ngày mất 8 giờ để chạy qua đêm, phụ thuộc nặng nề vào việc map dữ liệu theo các keys và reduce chúng xuống, ghi vào ổ đĩa ở mọi bước." },
  { answer: "I", text: "Bạn tìm kiếm trong một database 1 tỷ giao dịch để tìm bất kỳ hai người dùng nào đã thực hiện chính xác những giao dịch mua hàng giống hệt nhau vào đúng cùng một ngày. Bạn tìm thấy một kết quả khớp, nhưng nhận ra điều đó không có nghĩa là họ đang âm mưu cùng nhau; đó chỉ là tính tất yếu của thống kê." },
  { answer: "J", text: "Chuyên viên phân tích xác định trước rằng họ muốn có chính xác 4 phân khúc khách hàng (segments), và thuật toán liên tục di chuyển các điểm trung tâm cho đến khi tất cả khách hàng được nhóm vào 4 nhóm đó dựa trên thói quen chi tiêu." },
  { answer: "K", text: "Xây dựng một 'dendrogram' trực quan (biểu đồ hình cây) để xem làm thế nào các danh mục sản phẩm riêng lẻ tự nhiên hợp nhất (merge) thành các phòng ban lớn hơn, mà không cần quyết định trước số lượng nhóm." },
  { answer: "L", text: "Thêm 500 tracking metrics mới vào database khách hàng, khiến cho khoảng cách toán học giữa tất cả các khách hàng trông gần như giống hệt nhau, làm hỏng mô hình segmentation của bạn." },
  { answer: "J", text: "Nhóm các địa chỉ giao hàng thành 5 khu vực điều phối dựa hoàn toàn vào tọa độ vĩ độ và kinh độ vật lý của chúng." },
  { answer: "K", text: "Hệ thống bắt đầu bằng cách coi mỗi sản phẩm là một cụm (cluster) riêng biệt của nó, và từ từ hợp nhất hai sản phẩm giống nhau nhất từng bước một cho đến khi chỉ còn lại một cụm lớn duy nhất." },
  { answer: "L", text: "Một nhà khoa học dữ liệu nhất quyết tìm kiếm những người dùng tương tự dựa trên 10,000 thẻ hành vi khác nhau, dẫn đến một sparse matrix nơi các tính toán khoảng cách trở nên vô nghĩa." },
  { answer: "J", text: "Sử dụng 'Elbow Method' để tìm ra rằng k=3 là số lượng tối ưu các hạng mức chi tiêu cho chương trình VIP của bạn trước khi chạy thuật toán." },
  { answer: "L", text: "Lý do cốt lõi tại sao các nhà phân tích dữ liệu phải sử dụng Principal Component Analysis (PCA) để giảm số lượng features trước khi cố gắng tìm ra những điểm tương đồng trong các tập dữ liệu khổng lồ." },
  { answer: "M", text: "Đề xuất 'Giày chạy bộ Nike màu đỏ' vì người dùng trước đó đã mua 'Giày chạy bộ Nike màu xanh'." },
  { answer: "N", text: "Người dùng A và Người dùng B đều đã mua một chiếc laptop và một con chuột. Người dùng A mua một bàn phím. Hệ thống đề xuất một bàn phím cho Người dùng B." },
  { answer: "O", text: "Một người dùng tải xuống ứng dụng lần đầu tiên, vì vậy hệ thống hiển thị chung chung 'Các mặt hàng bán chạy nhất tại Quốc gia của bạn' cho đến khi họ nhấp vào một cái gì đó." },
  { answer: "M", text: "Một người mua sắm thêm món ăn vặt 'Vegan, Gluten-Free' vào giỏ hàng của họ, vì vậy hệ thống lọc siêu dữ liệu (metadata) của danh mục để chỉ hiển thị các mặt hàng khác được gắn thẻ 'Vegan' và 'Gluten-Free'." },
  { answer: "N", text: "Hệ thống bỏ qua hoàn toàn các mô tả sản phẩm thực tế và chỉ dựa vào ma trận tương tác (user-item interaction matrix) toán học để tìm ra các mô hình hành vi." },
  { answer: "O", text: "Một người bán hàng hoàn toàn mới tải lên một chiếc ví handmade, nhưng vì chưa có ai mua nó, recommendation engine không thể dựa vào lịch sử người dùng để quảng bá nó." },
  { answer: "M", text: "Phân tích các tags, categories và điểm TF-IDF của mô tả một bộ phim để đề xuất một bộ phim tương tự về mặt khái niệm." },
  { answer: "N", text: "Mô hình kinh điển của Amazon: 'Những người đã mua TV này cũng đã mua cáp HDMI này.'" },
  { answer: "Q", text: "Google xác định rằng một link trỏ đến cửa hàng của bạn từ CNN.com có trọng số toán học (mathematical weight) đáng kể hơn nhiều so với một link từ blog cá nhân của anh họ bạn." },
  { answer: "R", text: "Một marketplace khổng lồ có 50 triệu trang sản phẩm, nhưng Googlebot chỉ có tài nguyên máy chủ để lập chỉ mục (index) 2 triệu trang trong số đó mỗi ngày." },
  { answer: "S", text: "Đảm bảo mọi trang sản phẩm trên website của bạn đều link ngược lên trang category gốc của nó để các công cụ tìm kiếm có thể hiểu hệ thống phân cấp (hierarchy) website của bạn." },
  { answer: "T", text: "Thứ hạng tìm kiếm của bạn tụt dốc thê thảm chỉ sau một đêm vì bạn đã mua những backlinks giá rẻ được đặt trên một diễn đàn khét tiếng chứa malware." },
  { answer: "P", text: "Thực tiễn kỹ thuật và tiếp thị tổng quát để tối ưu hóa tiêu đề trang, tốc độ tải và keywords để xếp hạng cao hơn trong kết quả tìm kiếm tự nhiên (organic search)." },
  { answer: "Q", text: "Một thuật toán mô phỏng một 'người lướt web ngẫu nhiên' (random surfer) nhấp vào các links không ngừng trên toàn bộ web để tính toán xác suất hạ cánh trên một web page cụ thể." },
  { answer: "R", text: "Sử dụng file robots.txt để chặn Google đọc các trang đăng nhập (user-login) và giỏ hàng vô dụng của bạn, tiết kiệm thời gian hạn chế của nó cho các trang sản phẩm thực tế của bạn." },
  { answer: "S", text: "Tạo một widget 'Related Products' ở cuối trang, cố ý truyền sức mạnh xếp hạng (ranking power) từ một mặt hàng có lượng truy cập cao sang một mặt hàng ít được biết đến hơn trên domain của chính bạn." },
  { answer: "T", text: "Cố gắng gian lận hệ thống bằng cách mua một gói 10,000 automated backlinks từ một mạng lưới 'link farm', dẫn đến việc domain của bạn bị đưa vào blacklist." },
  { answer: "Q", text: "Nền tảng toán học ban đầu đã khiến Google vượt trội hơn các công cụ tìm kiếm sơ khai bằng cách coi các links như những 'lá phiếu' bình chọn (votes) có trọng số ảnh hưởng." },
  { answer: "P", text: "Thêm alt-text vào hình ảnh sản phẩm và đảm bảo trang web là mobile-friendly để làm hài lòng các thuật toán của công cụ tìm kiếm." },
  { answer: "R", text: "Loại bỏ content trùng lặp và các vòng lặp lịch vô tận (infinite calendar loops) để Googlebot không lãng phí các server requests được phân bổ của nó vì bị mắc kẹt trên các trang vô dụng." }
];

const P2_SCENARIOS = [
  { output: "Để chuẩn bị cho lượng truy cập 11.11 Flash Sale, chúng ta chỉ nên mua máy chủ mainframe mạnh nhất, đắt tiền nhất trên thị trường.", q: "Chiến lược scaling nào là tiêu chuẩn thực tế của ngành e-commerce thay cho cách trên?", a: "Horizontal Scaling" },
  { output: "Chúng ta cần xử lý các thuật toán phát hiện gian lận trực tiếp trong khi người dùng đang thanh toán. Hãy sử dụng Hadoop Map-Reduce để lưu dữ liệu vào ổ cứng ở mọi bước.", q: "Framework in-memory hiện đại nào mà đội dữ liệu nên sử dụng thay thế để đạt tốc độ real-time?", a: "Apache Spark" },
  { output: "Khối lượng giao dịch của chúng ta đang tăng lên. Hãy tải 50 triệu dòng dữ liệu log vào Microsoft Excel để team marketing phân tích.", q: "Khái niệm Big Data (bắt đầu bằng V) nào giải thích lý do tại sao Excel sẽ bị treo ngay lập tức ở đây?", a: "Volume" },
  { output: "Hệ thống đang chật vật để lưu trữ 10 Petabytes video sản phẩm trên một database. Hãy mua một ổ cứng lớn hơn.", q: "Công nghệ nào phân tán các file khổng lồ qua hàng nghìn ổ cứng tiêu chuẩn?", a: "Distributed File System" },
  { output: "Dashboard kho hàng trực tiếp của chúng ta cập nhật một lần mỗi 24 giờ qua một batch job.", q: "Đặc điểm '3Vs' nào của Big Data mà batch job này đang thất bại trong việc giải quyết?", a: "Velocity" },
  { output: "Chúng ta phải xây dựng một relational database SQL nghiêm ngặt để chứa tất cả dữ liệu của mình, bao gồm các bảng cứng nhắc, video đánh giá TikTok phi cấu trúc và log JSON thô.", q: "Đặc điểm '3Vs' nào khiến SQL database cứng nhắc trở thành một lựa chọn tồi tệ cho hỗn hợp các loại dữ liệu này?", a: "Variety" },
  { output: "Trong số 1 tỷ người mua sắm, tôi đã tìm thấy 5 người đã mua chính xác 12 mặt hàng ngẫu nhiên giống hệt nhau vào thứ Ba. Họ chắc chắn là một nhóm lừa đảo có tổ chức!", q: "Nguyên lý thống kê nào chứng minh đây chỉ là một tính tất yếu ngẫu nhiên của toán học?", a: "Bonferroni Principle" },
  { output: "Chúng tôi đã tìm thấy một quy tắc kết hợp: {Gaming PC} -> {Mousepad}. Chúng ta nên giảm giá mạnh Gaming PC để bán được nhiều Mousepads hơn.", q: "Mặt hàng nào (PC hay Mousepad) thực sự nên nhận được mức giảm giá để tối đa hóa lợi nhuận?", a: "Mousepad" },
  { output: "Để tìm các bundle tốt nhất, hãy tính toán Lift cho mọi kết hợp có thể có của 5 triệu sản phẩm của chúng ta cùng lúc!", q: "Thuật toán cụ thể nào chúng ta phải chạy trước tiên để xóa bỏ các mặt hàng hiếm và tiết kiệm tài nguyên tính toán?", a: "A-Priori Algorithm" },
  { output: "Confidence cho {Socks} -> {Shoes} rất cao, nhưng overall metric cho thấy tần suất chúng được mua cùng nhau trong tổng số tất cả các giao dịch chỉ là 0.001.", q: "Market Basket metric nào (một từ) mà AI đang mô tả là 0.001?", a: "Support" },
  { output: "Mô hình segmentation khách hàng K-Means của chúng ta đã nhóm một sinh viên chi 10 đô la và một VIP chi 10.000 đô la vào cùng một cụm (cluster) giống hệt nhau.", q: "Bước chuẩn bị dữ liệu quan trọng nào đã bị quên trước khi chạy các tính toán khoảng cách?", a: "Scaling" },
  { output: "Để làm cho clustering của chúng ta chính xác hoàn hảo, hãy sử dụng tất cả 15.000 tracking variables có sẵn cùng một lúc để tính toán khoảng cách giữa các người dùng.", q: "Khái niệm toán học nào chứng minh điều này thực tế sẽ làm cho tất cả người dùng trông xa nhau một cách bằng nhau?", a: "Curse of Dimensionality" },
  { output: "Tôi muốn tự động tổ chức 50.000 sản phẩm rời rạc của chúng ta thành một cây danh mục phân nhánh (ví dụ: Electronics -> Phones -> Apple), vì vậy tôi sẽ sử dụng K-Means.", q: "Loại clustering cụ thể nào nên được sử dụng để xây dựng cấu trúc cây lồng nhau (nested tree structure) này?", a: "Hierarchical Clustering" },
  { output: "Chúng ta sẽ sử dụng K-Means Clustering để nhóm người mua sắm của mình, nhưng chúng ta hoàn toàn không biết nên chia họ thành bao nhiêu nhóm.", q: "Phương pháp trực quan nào nhà phân tích nên sử dụng để tìm 'K' tối ưu?", a: "Elbow Method" },
  { output: "Chúng ta có một người dùng hoàn toàn mới vừa đăng ký cách đây 5 giây. Hãy sử dụng Collaborative Filtering để đề xuất sản phẩm dựa trên lịch sử mua hàng trong quá khứ của họ.", q: "Chiến lược nào phải được sử dụng thay thế khi người dùng chưa có lịch sử?", a: "Cold Start Strategy" },
  { output: "Điểm số Jaccard Similarity giữa {Samsung, S24, Ultra, 512GB} và {Samsung, S24, Ultra, 512GB, Case} là 0.80. Chúng ta nên tự động merge chúng vào cùng một danh sách sản phẩm.", q: "Nêu từ chính xác trong tập hợp thứ hai chứng minh việc merge chúng sẽ gây ra số lượng hoàn tiền (refunds) khổng lồ từ khách hàng.", a: "Case" },
  { output: "Người dùng A đã mua một cái lều. Để đề xuất một cái gì đó khác, hãy tìm những người dùng khác cũng mua lều và xem họ đã mua những gì khác.", q: "Chiến lược Recommendation nào đang được AI mô tả ở đây?", a: "Collaborative Filtering" },
  { output: "Người dùng A đã mua một cái lều. Để đề xuất một cái gì đó khác, hãy quét các tags sản phẩm (Outdoor, Camping, Nylon) và tìm một mặt hàng khác có các tags giống hệt.", q: "Chiến lược Recommendation nào đang được AI mô tả ở đây?", a: "Content-Based Filtering" },
  { output: "Để cải thiện thứ hạng tìm kiếm nhanh chóng, team marketing nên mua 5.000 links từ các trang blog trống rỗng, tự động.", q: "Bản cập nhật thuật toán cụ thể nào của Google phát hiện và trừng phạt chiến thuật 'bad neighborhood' này?", a: "TrustRank" },
  { output: "Chúng ta có một widget infinite calendar trên trang web của mình tạo ra hàng triệu URL ngày tháng vô dụng. Googlebot đang bị mắc kẹt đọc chúng và bỏ qua các sản phẩm thực tế của chúng ta.", q: "Khái niệm SEO nào mô tả khoảng thời gian giới hạn mà công cụ tìm kiếm phân bổ để quét (scan) trang web của bạn?", a: "Crawl Budget" }
];

const P3_SECTIONS = [
  [ // Section 1: Jaccard
    { t: "Jaccard Similarity", body: "ID 101: {Samsung, Galaxy, S24, Ultra, 512GB, Black}\nID 102: {Samsung, Galaxy, S24, Ultra, 512GB, Black, Unlocked}\nID 103: {Samsung, Galaxy, S23, Ultra, 512GB, Black}\nQuy tắc: Merge >= 0.80. Xóa tên ngắn nhất.", qs: ["Điểm Jaccard Similarity giữa 101 và 102 là bao nhiêu? (Cung cấp phân số hoặc số thập phân)", "Dựa trên quy tắc kinh doanh, chính xác Product ID nào (101, 102, hoặc 103) bị xóa vĩnh viễn khỏi database hôm nay?"] },
    { t: "Jaccard Similarity", body: "ID 201: {Nike, Air, Max, 90, Running, Shoe} - Giá: $120\nID 202: {Nike, Air, Max, 90, Running, Shoe, White} - Giá: $125\nID 203: {Nike, Air, Zoom, Pegasus, Running, Shoe} - Giá: $110\nQuy tắc: Merge > 0.75. Xóa mặt hàng đắt hơn.", qs: ["Điểm Jaccard Similarity giữa 201 và 202 là bao nhiêu? (Cung cấp phân số hoặc số thập phân)", "Dựa trên quy tắc kinh doanh, chính xác Product ID nào (201, 202, hoặc 203) bị xóa vĩnh viễn khỏi database hôm nay?"] },
    { t: "Jaccard Similarity", body: "ID 301: {Apple, MacBook, Pro, M3, 16GB, 1TB} - (Tồn kho: 5)\nID 302: {Apple, MacBook, Pro, M3, 16GB, 1TB, Refurbished} - (Tồn kho: 2)\nID 303: {Apple, MacBook, Air, M3, 16GB, 1TB} - (Tồn kho: 10)\nQuy tắc: Merge >= 0.80. Danh sách kết hợp PHẢI giữ lại tag 'Refurbished'.", qs: ["Điểm Jaccard Similarity giữa 301 và 302 là bao nhiêu? (Cung cấp phân số hoặc số thập phân)", "Sau khi hệ thống tự động chạy, tổng số lượng Tồn kho chính xác của listing 'Refurbished' là bao nhiêu?"] }
  ],
  [ // Section 2: Market Basket
    { t: "Market Basket Analysis", body: "Ngân sách: $500\n1. Laptop, Wireless Mouse, Keyboard\n2. Laptop, Wireless Mouse\n3. Laptop, Keyboard\n4. Laptop, Wireless Mouse\n5. Wireless Mouse, Headset\nBundle A: Mua Laptop, nhận giảm giá Wireless Mouse.\nBundle B: Mua Laptop, nhận giảm giá Keyboard.", qs: ["Tính giá trị Lift chính xác cho Bundle A.", "Tính giá trị Lift chính xác cho Bundle B.", "Dựa trên tính toán của bạn, bundle nào (A hay B) thực tế đang làm giảm doanh số bán tự nhiên (organic sales), và bundle nào nên nhận được ngân sách $500?"] },
    { t: "Market Basket Analysis", body: "Ngân sách: $5,000\n1. Winter Coat, Snow Boots, Wool Scarf\n2. Winter Coat, Snow Boots, Wool Scarf\n3. Winter Coat, Snow Boots\n4. Snow Boots, Gloves\n5. Snow Boots, Winter Hat\nBundle A: Mua Winter Coat, giảm giá Snow Boots.\nBundle B: Mua Winter Coat, giảm giá Wool Scarf.", qs: ["Tính giá trị Lift chính xác cho Bundle A.", "Tính giá trị Lift chính xác cho Bundle B.", "AI đặc biệt khuyên dùng Bundle A vì Confidence là 100%. Giải thích bằng một câu lý do tại sao AI sai, và cho biết bundle nào thực sự sẽ nhận được ngân sách quảng cáo?"] },
    { t: "Market Basket Analysis", body: "Ngân sách: Email Khuyến mãi\n1. Cleanser, Moisturizer\n2. Cleanser, Moisturizer, Vitamin C Serum\n3. Cleanser, Moisturizer, Vitamin C Serum\n4. Cleanser, Eye Cream\n5. Moisturizer, Eye Cream\nBundle A: {Cleanser} -> {Moisturizer}\nBundle B: {Cleanser} -> {Vitamin C Serum}", qs: ["Tính giá trị Lift chính xác cho Bundle A.", "Tính giá trị Lift chính xác cho Bundle B.", "Người quản lý muốn chạy Bundle A vì '75% số người mua Cleanser cũng mua Moisturizer'. Dựa trên tính toán Lift của bạn, người quản lý đúng hay sai, và bạn thực sự nên chạy bundle nào?"] }
  ],
  [ // Section 3: CF
    { t: "Collaborative Filtering", body: "Người dùng mục tiêu (Sam): {Yoga Mat, Dumbbells}\nNgười dùng 1: {Yoga Mat, Dumbbells, Kettlebell, Resistance Bands}\nNgười dùng 2: {Yoga Mat, Dumbbells, Treadmill}\nNgười dùng 3: {Dumbbells, Kettlebell}\nNgười dùng 4: {Yoga Mat, Dumbbells, Kettlebell}\nCác mặt hàng: Kettlebell(50 lbs), Treadmill(150 lbs), Resistance Bands(2 lbs).\nRàng buộc: Peers hợp lệ cần >= 2 items giống nhau. Không có kiện hàng nào quá 40 lbs.", qs: ["Dựa hoàn toàn vào thuật toán bỏ phiếu CF (bỏ qua trọng lượng), mặt hàng nào nhận được nhiều votes hợp lệ nhất?", "Hệ thống cuối cùng đề xuất chính xác mặt hàng nào làm phương án dự phòng (backup)?"] },
    { t: "Collaborative Filtering", body: "Người dùng mục tiêu (Leo - 15 tuổi): {Console, Racing Game}\nNgười dùng 1: {Console, Racing Game, Zombie Shooter, Extra Controller}\nNgười dùng 2: {Console, Racing Game, Zombie Shooter}\nNgười dùng 3: {Racing Game, Extra Controller}\nNgười dùng 4: {Console, Racing Game, Headset}\nCác mặt hàng: Zombie Shooter(Đánh giá 18+, $50), Extra Controller(All Ages, $70), Headset(All Ages, $40).\nRàng buộc: Peers hợp lệ cần >= 2 items giống nhau. Không cho phép game 18+. Hòa (Tiebreaker): Chọn món rẻ hơn.", qs: ["Dựa hoàn toàn vào thuật toán bỏ phiếu CF (bỏ qua độ tuổi), mặt hàng nào nhận được nhiều votes hợp lệ nhất?", "Hệ thống cuối cùng đề xuất chính xác mặt hàng nào cho Leo?"] },
    { t: "Collaborative Filtering", body: "Người dùng mục tiêu (Mia - Canada): {Action Movie A, Comedy Movie B}\nNgười dùng 1: {Action Movie A, Comedy Movie B, Sci-Fi Movie C, Drama Movie D}\nNgười dùng 2: {Action Movie A, Comedy Movie B, Sci-Fi Movie C}\nNgười dùng 3: {Comedy Movie B, Sci-Fi Movie C}\nNgười dùng 4: {Action Movie A, Comedy Movie B, Documentary E}\nCác mặt hàng: Sci-Fi C (Bị chặn ở CA, Rating 7.0), Drama D (CA, Rating 8.2), Doc E (CA, Rating 9.1).\nRàng buộc: Peers hợp lệ cần >= 2 items giống nhau. Không có item bị Geo-blocked. Hòa (Tiebreaker): IMDB Rating cao hơn.", qs: ["Dựa hoàn toàn vào thuật toán bỏ phiếu CF (bỏ qua giới hạn khu vực), bộ phim nào nhận được nhiều votes hợp lệ nhất?", "Hệ thống cuối cùng đề xuất chính xác bộ phim nào cho Mia?"] },
    { t: "Collaborative Filtering", body: "Người dùng mục tiêu (Emma - Dị ứng Đậu phộng): {Milk, Bread, Eggs}\nNgười dùng 1: {Milk, Bread, Eggs, Peanut Butter, Apple}\nNgười dùng 2: {Milk, Bread, Peanut Butter, Almonds}\nNgười dùng 3: {Bread, Eggs, Orange Juice}\nNgười dùng 4: {Milk, Bread, Eggs, Apple, Almonds}\nCác mặt hàng: Peanut Butter(Chứa Đậu phộng, 190cal), Almonds(Không Đậu phộng, 160cal), Apple(Không Đậu phộng, 95cal).\nRàng buộc: Peers hợp lệ cần >= 2 items giống nhau. Bỏ qua mặt hàng có đậu phộng. Hòa (Tiebreaker): lượng calo thấp hơn.", qs: ["Dựa hoàn toàn vào thuật toán bỏ phiếu CF (bỏ qua dị ứng), mặt hàng nào nhận được nhiều votes hợp lệ nhất?", "Hệ thống cuối cùng đề xuất chính xác mặt hàng nào cho Emma?"] },
    { t: "Collaborative Filtering", body: "Người dùng mục tiêu (David - Người dùng USB-C): {iPhone 15, Phone Case}\nNgười dùng 1: {iPhone 15, Phone Case, AirPods, USB-C Charger}\nNgười dùng 2: {iPhone 15, Phone Case, Lightning Cable, AirPods}\nNgười dùng 3: {Phone Case, Screen Protector}\nNgười dùng 4: {iPhone 15, Phone Case, USB-C Charger, Lightning Cable}\nCác mặt hàng: Lightning Cable(Không tương thích, Profit $10), AirPods(Tương thích, Profit $30), USB-C Charger(Tương thích, Profit $35).\nRàng buộc: Peers hợp lệ cần >= 2 items giống nhau. Bỏ qua Lightning. Hòa (Tiebreaker): Biên lợi nhuận (profit margin) cao nhất.", qs: ["Dựa hoàn toàn vào thuật toán bỏ phiếu CF (bỏ qua tính tương thích), hai mặt hàng nào hòa nhau ở số votes hợp lệ cao nhất?", "Hệ thống cuối cùng đề xuất chính xác mặt hàng nào cho David?"] },
    { t: "Collaborative Filtering", body: "Người dùng mục tiêu (Sarah - Mùa Hè): {T-Shirt, Jeans}\nNgười dùng 1: {T-Shirt, Jeans, Winter Coat, Sunglasses}\nNgười dùng 2: {T-Shirt, Jeans, Winter Coat, Sneakers}\nNgười dùng 3: {Jeans, Beanie}\nNgười dùng 4: {T-Shirt, Jeans, Sunglasses, Sneakers}\nCác mặt hàng: Winter Coat(Mùa đông, Rating 4.9), Sunglasses(Mùa hè, Rating 4.8), Sneakers(All-Season, Rating 4.9).\nRàng buộc: Peers hợp lệ cần >= 2 items giống nhau. Ẩn Trang phục Mùa đông. Hòa (Tiebreaker): Điểm đánh giá (review score) cao nhất.", qs: ["Dựa hoàn toàn vào thuật toán bỏ phiếu CF (bỏ qua mùa), mặt hàng nào nhận được nhiều votes hợp lệ nhất?", "Hệ thống cuối cùng đề xuất chính xác mặt hàng nào cho Sarah?"] }
  ]
];

const highlightPython = (code) => {
  const regex = /(\[Blank \d+\])|(#.*)|('.*?'|".*?")|\b(def|import|from|return|len|print)\b|\b(SparkSession|KMeans|StandardScaler|apriori|association_rules)\b|\b(\d+(\.\d+)?)\b/g;
  let highlighted = code.replace(regex, (match, blank, comment, str, kw, lib, num) => {
    if (blank) return `<span class="bg-yellow-200 text-black px-1 rounded font-bold">${blank}</span>`;
    if (comment) return `<span class="text-slate-400 italic">${comment}</span>`;
    if (str) return `<span class="text-yellow-300">${str}</span>`;
    if (kw) return `<span class="text-pink-400 font-semibold">${kw}</span>`;
    if (lib) return `<span class="text-blue-300 font-semibold">${lib}</span>`;
    if (num) return `<span class="text-purple-400">${num}</span>`;
    return match;
  });
  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

const P4_SCENARIOS = [
  { t: "Xử lý dữ liệu với PySpark", body: "def calculate_jaccard(set_A, set_B):\n  # Tính số lượng mặt hàng chung\n  common = len(set_A.[Blank 1](set_B))\n  # Tính tổng số lượng mặt hàng duy nhất\n  total = len(set_A.[Blank 2](set_B))\n  return common / total\n\nfrom pyspark.sql import SparkSession\nspark = SparkSession.builder.appName('EcomData').getOrCreate()\n# Tải dataset 50GB vào bộ nhớ Spark\ndf = spark.[Blank 3].[Blank 4]('sales_data.csv', [Blank 5]=True)" },
  { t: "Thực thi Market Basket Analysis Code", body: "from mlxtend.frequent_patterns import apriori, association_rules\n# Chạy thuật toán và yêu cầu các mặt hàng xuất hiện trong ít nhất 10% các lần thanh toán\nfrequent_items = [Blank 1](checkout_dataframe, [Blank 2]=0.10, use_colnames=True)\n# Tính toán các rules sử dụng 'Lift' làm business metric chính\nbundle_rules = [Blank 3](frequent_items, [Blank 4]='lift', min_threshold=1.5)\n# Hiển thị 5 bundles có tỷ lệ chuyển đổi cao nhất\nprint(bundle_rules.[Blank 5](5))" },
  { t: "Phân cụm khách hàng (Customer Segmentation) với K-Means", body: "from sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\n# Chuẩn hóa (Normalize) dữ liệu để khắc phục khoảng cách\nscaler = [Blank 1]()\nscaled_data = scaler.fit_transform(customer_data)\n# Chúng ta muốn có chính xác 3 nhóm khách hàng dựa trên Elbow Method\nsegment_model = [Blank 2]([Blank 3]=3)\n# Đưa dữ liệu đã chuẩn hóa vào model\nsegment_model.[Blank 4](scaled_data)\n# Gán nhóm khách hàng\ncustomer_data['Segment_ID'] = segment_model.[Blank 5](scaled_data)" },
  { t: "Item-Item Collaborative Filtering", body: "import pandas as pd\ndf_matrix = pd.read_csv('ratings_matrix.csv', index_col='User_ID')\n# Tính hệ số tương quan Pearson giữa tất cả các sản phẩm\nitem_similarity = df_matrix.[Blank 1]()\nmouse_sims = item_similarity['Wireless Mouse']\n# Xóa 'Wireless Mouse' khỏi danh sách\nmouse_sims = mouse_sims.[Blank 2]('Wireless Mouse')\n# Sắp xếp các mặt hàng còn lại từ hệ số tương quan cao nhất đến thấp nhất\ntop_recs = mouse_sims.[Blank 3](ascending=[Blank 4])\n# Hiển thị 3 mặt hàng tốt nhất để đề xuất\nprint(top_recs.[Blank 5](3))" }
];

export default function MidtermTestSimulation() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(90 * 60);

  useEffect(() => {
    let timer;
    if (testStarted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  const startTest = () => {
    if (!name.trim() || !studentId.trim()) {
      alert("Vui lòng nhập Họ và Tên và Mã Sinh viên");
      return;
    }

    const seedStr = studentId.trim();
    const seed = cyrb128(seedStr);
    const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

    const shuffledP1 = [...P1_SCENARIOS].sort(() => rand() - 0.5).slice(0, 15);
    const shuffledP2 = [...P2_SCENARIOS].sort(() => rand() - 0.5).slice(0, 5);
    const selectedP3 = P3_SECTIONS.map(sec => sec[Math.floor(rand() * sec.length)]);
    const selectedP4 = P4_SCENARIOS[Math.floor(rand() * P4_SCENARIOS.length)];

    setTestData({
      p1: shuffledP1,
      p2: shuffledP2,
      p3: selectedP3,
      p4: selectedP4
    });
    setTestStarted(true);
  };

  const updateAnswer = (section, id, val) => {
    setAnswers(prev => ({ ...prev, [section + "_" + id]: val }));
  };

  const generateFile = () => {
    let content = "BÀI THI GIỮA KỲ\n";
    content += "Họ và Tên: " + name + "\n";
    content += "Mã Sinh viên: " + studentId + "\n";
    content += "Thời gian làm bài: " + (90 - Math.floor(timeLeft / 60)) + " phút\n";
    content += "-------------------------------------------------\n\n";

    content += "--- PHẦN 1: LÝ THUYẾT ---\n";
    testData.p1.forEach((q, i) => {
      content += "Câu " + (i+1) + ": " + q.text + "\n";
      content += "Trả lời: " + (answers["p1_" + i] || 'Chưa trả lời') + "\n\n";
    });

    content += "--- PHẦN 2: KIỂM TOÁN AI ---\n";
    testData.p2.forEach((q, i) => {
      content += "AI Output: " + q.output + "\n";
      content += "Câu hỏi: Câu " + (i+1) + ": " + q.q + "\n";
      content += "Trả lời: " + (answers["p2_" + i] || 'Chưa trả lời') + "\n\n";
    });

    content += "--- PHẦN 3: BÀI TẬP TOÁN ---\n";
    testData.p3.forEach((q, i) => {
      content += "Kịch bản " + (i+1) + ": " + q.t + "\n";
      q.qs.forEach((subQ, j) => {
        content += "> Câu " + (i+1) + "." + (j+1) + ": " + subQ + "\n";
        content += "Trả lời: " + (answers["p3_" + i + "_" + j] || 'Chưa trả lời') + "\n";
      });
      content += "\n";
    });

    content += "--- PHẦN 4: THỰC THI CODE ---\n";
    content += "Câu 4: " + testData.p4.t + "\n";
    for(let i=1; i<=5; i++) {
      content += "Ô trống " + i + ": " + (answers["p4_" + i] || 'Chưa trả lời') + "\n";
    }

    // Embed base64 grading key
    let keyObj = {
      p1: testData.p1.map(q => q.answer),
      p2: testData.p2.map(q => q.a)
    };
    content += "\n--- GRADING KEY (TEACHER ONLY) ---\n";
    content += btoa(encodeURIComponent(JSON.stringify(keyObj)));

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Midterm_" + studentId + "_" + name.replace(/\s+/g, '_') + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!testStarted) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-white rounded shadow mt-10 text-slate-800">
        <h1 className="text-2xl font-bold mb-6">Bài thi Giữa kỳ</h1>
        <p className="mb-4 text-sm text-slate-600">Nhập thông tin của bạn để tạo đề thi riêng. Bạn sẽ có 90 phút để hoàn thành bài thi.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Họ và Tên</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded" 
              value={name} onChange={e => setName(e.target.value)} 
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Mã Sinh viên</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded" 
              value={studentId} onChange={e => setStudentId(e.target.value)} 
              placeholder="VD: 123456"
            />
          </div>
          <button 
            onClick={startTest}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-slate-800 pb-32">
      <div className="flex justify-between items-center bg-white p-4 sticky top-0 border-b shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold">Bài thi Giữa kỳ</h1>
          <p className="text-sm text-slate-500">{name} ({studentId})</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono font-bold text-red-600">
            {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
          </div>
          <p className="text-xs text-slate-500">Còn lại</p>
        </div>
      </div>

      <div className="mt-8 space-y-12">
        {/* PART 1 */}
        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Phần 1: Lý thuyết (35%)</h2>
          <p className="mb-4 text-sm">Ghép các kịch bản với các khái niệm tương ứng.</p>
          <div className="space-y-4">
            {testData.p1.map((q, i) => (
              <div key={i} className="bg-white p-4 rounded shadow-sm border">
                <p className="text-sm mb-2"><span className="font-bold">Câu {i+1}:</span> {q.text}</p>
                <select 
                  className="w-full border p-2 rounded text-sm bg-slate-50"
                  value={answers["p1_" + i] || ''}
                  onChange={e => updateAnswer('p1', i, e.target.value)}
                >
                  <option value="">Chọn một khái niệm...</option>
                  {CONCEPTS.map((c, idx) => (
                    <option key={idx} value={c[0]}>{c}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* PART 2 */}
        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Phần 2: Kiểm toán AI (20%)</h2>
          <div className="space-y-4">
            {testData.p2.map((q, i) => (
              <div key={i} className="bg-white p-4 rounded shadow-sm border">
                <div className="bg-slate-100 p-3 rounded mb-3 text-sm italic border-l-4 border-blue-400">
                  {q.output}
                </div>
                <p className="font-bold text-sm mb-2">Câu {i+1}: {q.q}</p>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded" 
                  placeholder="Câu trả lời 1-3 từ"
                  value={answers["p2_" + i] || ''}
                  onChange={e => updateAnswer('p2', i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* PART 3 */}
        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Phần 3: Bài tập Toán (30%)</h2>
          <div className="space-y-6">
            {testData.p3.map((q, i) => (
              <div key={i} className="bg-white p-4 rounded shadow-sm border">
                <h3 className="font-bold mb-2">Kịch bản {i+1}: {q.t}</h3>
                <pre className="text-xs bg-slate-100 p-3 rounded mb-4 whitespace-pre-wrap">{q.body}</pre>
                <div className="space-y-3">
                  {q.qs.map((subQ, j) => (
                    <div key={j}>
                      <p className="text-sm mb-1 font-semibold">Câu {i+1}.{j+1}: {subQ}</p>
                      <input 
                        type="text" 
                        className="w-full border p-2 rounded text-sm" 
                        value={answers["p3_" + i + "_" + j] || ''}
                        onChange={e => updateAnswer('p3', i + "_" + j, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PART 4 */}
        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Phần 4: Thực thi Code (15%)</h2>
          <div className="bg-white p-4 rounded shadow-sm border">
            <h3 className="font-bold mb-2">Câu 4: {testData.p4.t}</h3>
            <pre className="text-xs font-mono bg-slate-900 p-4 rounded mb-4 whitespace-pre-wrap overflow-x-auto text-white">
              {highlightPython(testData.p4.body)}
            </pre>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4,5].map(b => (
                <div key={b}>
                  <label className="block text-sm font-bold mb-1">Ô trống {b}</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded font-mono text-sm" 
                    value={answers["p4_" + b] || ''}
                    onChange={e => updateAnswer('p4', b, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg flex justify-center z-50">
        <button 
          onClick={generateFile}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
        >
          Hoàn thành & Tải xuống File Nộp bài
        </button>
      </div>
    </div>
  );
}