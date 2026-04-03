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
  "J. K-Means Clustering", "K. Hierarchical Clustering", "L. The Curse of Dimensionality",
  "M. Content-Based Filtering", "N. Collaborative Filtering", "O. Cold Start Strategy",
  "P. General SEO Practices", "Q. PageRank Algorithm", "R. Crawl Budget", "S. Internal Linking", "T. Bad Neighborhood / Link Spam"
];

const P1_SCENARIOS = [
  { answer: "B", text: "Processing thousands of credit card swipes and adjusting inventory counts every single millisecond during a Black Friday flash sale." },
  { answer: "C", text: "The data lake ingestion pipeline crashes because it suddenly receives a mix of structured SQL tables, unstructured JPEG images, and raw text reviews." },
  { answer: "A", text: "A clothing retailer realizes their legacy database cannot physically hold the 10 petabytes of historical clickstream data generated over the last five years." },
  { answer: "D", text: "To handle the holiday rush, the DevOps team adds 50 new, relatively cheap commodity web servers to the existing cluster to share the traffic load." },
  { answer: "E", text: "Upgrading your single, central monolithic database server by replacing its 128GB of RAM with 512GB of RAM to handle larger queries." },
  { answer: "F", text: "Splitting a massive 500GB server log file into 128MB chunks and spreading those blocks across 10 different physical hard drives for storage." },
  { answer: "G", text: "An analyst abandons Excel because it freezes at 1 million rows, moving to a modern framework that distributes the dataframe entirely across a cluster's RAM to avoid slow hard-drive reads." },
  { answer: "H", text: "A legacy data pipeline that reads from the disk, processes a batch of data, writes the intermediate results back to the hard drive, and repeats this slow process for hours." },
  { answer: "I", text: "A data team flags 50,000 normal shoppers as 'fraudsters' because their algorithm looked for so many random behavioral overlaps that it found statistical 'patterns' that were actually just random chance." },
  { answer: "B", text: "A real-time dashboard that updates warehouse delivery logistics the exact moment a delivery truck passes a GPS checkpoint." },
  { answer: "C", text: "Trying to join a strict relational database of user profiles with a stream of emojis and messy slang from a TikTok social listening API." },
  { answer: "A", text: "Realizing that storing every single mouse movement of every user on your site will require transitioning from megabytes to terabytes of storage daily." },
  { answer: "D", text: "E-commerce traffic drops in January, so the cloud provider automatically shuts down 20 redundant virtual machines to save costs without taking the site offline." },
  { answer: "E", text: "Buying the absolute most expensive, top-tier processor from Intel to replace the old CPU in your single backend server." },
  { answer: "F", text: "A server catches fire, but the system stays online with no data lost because the data blocks were automatically replicated across three other nodes upon ingestion." },
  { answer: "G", text: "Using a modern execution engine to run real-time machine learning models because it caches the working data in-memory rather than relying on disk I/O." },
  { answer: "H", text: "Using a Hadoop framework to process log files where processing speed is not an issue, but extreme fault tolerance during the slow, sequential disk-writing phases is required." },
  { answer: "I", text: "Calculating the probability of rare events occurring together to prove to the marketing director that her new 'insight' is mathematically useless due to a massive sample size." },
  { answer: "D", text: "The core philosophy of 'The Technology of Scale': Instead of buying one supercomputer, Shopee uses thousands of standard computers working together." },
  { answer: "G", text: "Utilizing DataFrames in a distributed environment to execute a query 100x faster than legacy Hadoop systems." },
  { answer: "H", text: "A daily batch job that takes 8 hours to run overnight, relying heavily on mapping data to keys and reducing them down, writing to disk at every step." },
  { answer: "I", text: "You search a database of 1 billion transactions looking for any two users who made the exact same purchases on the exact same days. You find a match, but realize it doesn't mean they are conspiring together; it's just a statistical inevitability." },
  { answer: "J", text: "The analyst pre-defines that they want exactly 4 customer segments, and the algorithm continuously moves the center points until all customers are grouped into those 4 buckets based on spending habits." },
  { answer: "K", text: "Building a visual 'dendrogram' (tree diagram) to see how individual product categories naturally merge into larger departments, without deciding the number of groups in advance." },
  { answer: "L", text: "Adding 500 new tracking metrics to the customer database, causing the mathematical distance between all customers to look practically identical, which breaks your segmentation model." },
  { answer: "J", text: "Grouping delivery addresses into 5 regional dispatch zones based solely on their physical latitude and longitude coordinates." },
  { answer: "K", text: "The system starts by treating every single product as its own distinct cluster, and slowly merges the two most similar products step-by-step until there is only one massive cluster left." },
  { answer: "L", text: "A data scientist insists on finding similar users based on 10,000 different behavioral tags, resulting in a sparse matrix where distance calculations become meaningless." },
  { answer: "J", text: "Using the 'Elbow Method' to figure out that k=3 is the optimal number of spending tiers for your VIP program before running the algorithm." },
  { answer: "L", text: "The core reason why data analysts must use Principal Component Analysis (PCA) to reduce the number of features before attempting to find similarities in massive datasets." },
  { answer: "M", text: "Recommending a 'Red Nike Running Shoe' because the user previously purchased a 'Blue Nike Running Shoe.'" },
  { answer: "N", text: "User A and User B both bought a laptop and a mouse. User A buys a keyboard. The system recommends a keyboard to User B." },
  { answer: "O", text: "A user downloads the app for the very first time, so the system displays the generic 'Top Selling Items in your Country' until they click on something." },
  { answer: "M", text: "A shopper adds a 'Vegan, Gluten-Free' snack to their cart, so the system filters the catalog metadata to show only other items tagged with 'Vegan' and 'Gluten-Free'." },
  { answer: "N", text: "The system ignores the actual product descriptions entirely and relies purely on the mathematical user-item interaction matrix to find behavioral patterns." },
  { answer: "O", text: "A brand new merchant uploads a custom handmade wallet, but because nobody has bought it yet, the recommendation engine cannot rely on user history to promote it." },
  { answer: "M", text: "Analyzing the tags, categories, and TF-IDF scores of a movie's description to recommend a conceptually similar movie." },
  { answer: "N", text: "The classic Amazon model: 'People who bought this TV also bought this HDMI cable.'" },
  { answer: "Q", text: "Google determines that a link pointing to your store from CNN.com has significantly more mathematical weight than a link from your cousin's personal blog." },
  { answer: "R", text: "A massive marketplace has 50 million product pages, but Googlebot only has the server resources to index 2 million of them per day." },
  { answer: "S", text: "Ensuring every single product page on your website links back up to its parent category page so search engines can understand your site's hierarchy." },
  { answer: "T", text: "Your search ranking drops off a cliff overnight because you bought cheap backlinks that were placed on a forum known for hosting malware." },
  { answer: "P", text: "The overarching technical and marketing practice of optimizing page titles, loading speeds, and keywords to rank higher in organic search results." },
  { answer: "Q", text: "An algorithm that simulates a 'random surfer' clicking links endlessly across the web to calculate the probability of landing on one specific web page." },
  { answer: "R", text: "Using the robots.txt file to block Google from reading your useless user-login and shopping cart pages, saving its limited time for your actual product pages." },
  { answer: "S", text: "Creating a 'Related Products' widget at the bottom of the page, intentionally passing ranking power from a high-traffic item to a lesser-known item on your own domain." },
  { answer: "T", text: "Trying to cheat the system by buying a package of 10,000 automated backlinks from a 'link farm' network, resulting in your domain being blacklisted." },
  { answer: "Q", text: "The original mathematical foundation that made Google superior to early search engines by treating links as weighted 'votes' of influence." },
  { answer: "P", text: "Adding alt-text to product images and ensuring the site is mobile-friendly to appease search engine algorithms." },
  { answer: "R", text: "Eliminating duplicate content and infinite calendar loops so Googlebot doesn't waste its allocated server requests getting stuck on useless pages." }
];

const P2_SCENARIOS = [
  { output: "To prepare for the 11.11 Flash Sale traffic, we should just buy the single most expensive, powerful mainframe server on the market.", q: "What two-word scaling strategy is the actual e-commerce industry standard instead?", a: "Horizontal Scaling" },
  { output: "We need to process live fraud-detection algorithms while the user is checking out. Let's use Hadoop Map-Reduce to save the data to the hard drive at every step.", q: "What modern, in-memory framework should the data team use instead for real-time speed?", a: "Apache Spark" },
  { output: "Our transaction volume is growing. Let's load the 50 million rows of log data into Microsoft Excel for the marketing team to analyze.", q: "What Big Data concept (starting with V) explains why Excel will instantly crash here?", a: "Volume" },
  { output: "The system is struggling to store 10 Petabytes of product videos on one database. Let's buy a bigger hard drive.", q: "What three-word technology distributes massive files across thousands of standard hard drives?", a: "Distributed File System" },
  { output: "Our live inventory dashboard updates once every 24 hours via a batch job.", q: "Which of the '3Vs' of Big Data is this batch job failing to address?", a: "Velocity" },
  { output: "We must build a strict SQL relational database to hold all our data, including rigid tables, unstructured TikTok review videos, and raw JSON logs.", q: "Which of the '3Vs' makes a rigid SQL database a bad choice for this mix of data types?", a: "Variety" },
  { output: "Out of 1 billion shoppers, I found 5 people who bought the exact same 12 random items on a Tuesday. They must be a coordinated fraud ring!", q: "What two-word statistical principle proves this is just a random mathematical inevitability?", a: "Bonferroni Principle" },
  { output: "We found a strong association rule: {Gaming PC} -> {Mousepad}. We should heavily discount the Gaming PC to sell more Mousepads.", q: "Which item (PC or Mousepad) should actually receive the discount to maximize profit?", a: "Mousepad" },
  { output: "To find the best bundles, let's calculate the Lift for every single possible combination of our 5 million products simultaneously!", q: "What specific algorithm must we run first to delete the rare items and save computing power?", a: "A-Priori Algorithm" },
  { output: "The Confidence for {Socks} -> {Shoes} is high, but the overall metric showing how often they are bought together out of all transactions is only 0.001.", q: "What one-word Market Basket metric is the AI describing as being 0.001?", a: "Support" },
  { output: "Our K-Means customer segmentation model grouped a student who spent $10 and a VIP who spent $10,000 into the exact same cluster.", q: "What crucial data preparation step was forgotten before running the distance calculations?", a: "Scaling" },
  { output: "To make our clustering perfectly accurate, let's use all 15,000 available tracking variables at once to calculate the distance between users.", q: "What three-word mathematical concept proves this will actually make all users look equally far apart?", a: "Curse of Dimensionality" },
  { output: "I want to automatically organize our 50,000 loose products into a branching category tree (e.g., Electronics -> Phones -> Apple), so I will use K-Means.", q: "What specific type of clustering should be used to build this nested tree structure?", a: "Hierarchical Clustering" },
  { output: "We are going to use K-Means Clustering to group our shoppers, but we have absolutely no idea how many groups we should divide them into.", q: "What two-word visual method should the analyst use to find the optimal 'K'?", a: "Elbow Method" },
  { output: "We have a brand new user who just registered 5 seconds ago. Let's use Collaborative Filtering to recommend products based on their past purchase history.", q: "What three-word strategy must be used instead when a user has no history?", a: "Cold Start Strategy" },
  { output: "The Jaccard Similarity score between {Samsung, S24, Ultra, 512GB} and {Samsung, S24, Ultra, 512GB, Case} is 0.80. We should automatically merge them into one listing.", q: "State the exact word in the second set that proves merging these will cause massive customer refunds.", a: "Case" },
  { output: "User A bought a tent. To recommend something else, let's find other users who bought tents and see what else they bought.", q: "What two-word recommendation strategy is the AI describing here?", a: "Collaborative Filtering" },
  { output: "User A bought a tent. To recommend something else, let's scan the product tags (Outdoor, Camping, Nylon) and find another item with the exact same tags.", q: "What recommendation strategy is the AI describing here?", a: "Content-Based Filtering" },
  { output: "To improve our search ranking quickly, the marketing team should buy 5,000 links from empty, automated blog sites.", q: "What specific Google algorithm update detects and penalizes this 'bad neighborhood' tactic?", a: "TrustRank" },
  { output: "We have an infinite calendar widget on our site that generates millions of useless date URLs. Googlebot is getting stuck reading them and ignoring our actual products.", q: "What two-word SEO concept describes the limited amount of time a search engine allocates to scanning your site?", a: "Crawl Budget" }
];

const P3_SECTIONS = [
  [ // Section 1: Jaccard
    { t: "Jaccard Similarity", body: "ID 101: {Samsung, Galaxy, S24, Ultra, 512GB, Black}\nID 102: {Samsung, Galaxy, S24, Ultra, 512GB, Black, Unlocked}\nID 103: {Samsung, Galaxy, S23, Ultra, 512GB, Black}\nRule: Merge >= 0.80. Delete shortest title.", qs: ["What is Jaccard score between 101 and 102? (Provide fraction or decimal)", "Based on the business rule, which exact Product ID (101, 102, or 103) is permanently deleted from the database today?"] },
    { t: "Jaccard Similarity", body: "ID 201: {Nike, Air, Max, 90, Running, Shoe} - Price: $120\nID 202: {Nike, Air, Max, 90, Running, Shoe, White} - Price: $125\nID 203: {Nike, Air, Zoom, Pegasus, Running, Shoe} - Price: $110\nRule: Merge > 0.75. Delete expensive one.", qs: ["What is Jaccard score between 201 and 202? (Provide fraction or decimal)", "Based on the business rule, which exact Product ID (201, 202, or 203) is permanently deleted from the database today?"] },
    { t: "Jaccard Similarity", body: "ID 301: {Apple, MacBook, Pro, M3, 16GB, 1TB} - (Stock: 5)\nID 302: {Apple, MacBook, Pro, M3, 16GB, 1TB, Refurbished} - (Stock: 2)\nID 303: {Apple, MacBook, Air, M3, 16GB, 1TB} - (Stock: 10)\nRule: Merge >= 0.80. Combined listing MUST retain 'Refurbished' tag.", qs: ["What is Jaccard score between 301 and 302? (Provide fraction or decimal)", "After the automated system runs, what is the exact total Stock count of the 'Refurbished' listing?"] }
  ],
  [ // Section 2: Market Basket
    { t: "Market Basket Analysis", body: "Budget: $500\n1. Laptop, Wireless Mouse, Keyboard\n2. Laptop, Wireless Mouse\n3. Laptop, Keyboard\n4. Laptop, Wireless Mouse\n5. Wireless Mouse, Headset\nBundle A: Buy Laptop, get discount on Wireless Mouse.\nBundle B: Buy Laptop, get discount on Keyboard.", qs: ["Calculate the exact Lift for Bundle A.", "Calculate the exact Lift for Bundle B.", "Based on your calculations, which bundle (A or B) is actually just cannibalizing organic sales, and which bundle should receive the budget?"] },
    { t: "Market Basket Analysis", body: "Budget: $5,000\n1. Winter Coat, Snow Boots, Wool Scarf\n2. Winter Coat, Snow Boots, Wool Scarf\n3. Winter Coat, Snow Boots\n4. Snow Boots, Gloves\n5. Snow Boots, Winter Hat\nBundle A: Buy Winter Coat, discount Snow Boots.\nBundle B: Buy Winter Coat, discount Wool Scarf.", qs: ["Calculate the exact Lift for Bundle A.", "Calculate the exact Lift for Bundle B.", "The AI strongly recommends Bundle A because Confidence is 100%. Explain why it's wrong, and state which bundle actually gets the ad budget?"] },
    { t: "Market Basket Analysis", body: "Budget: Promo Email\n1. Cleanser, Moisturizer\n2. Cleanser, Moisturizer, Vitamin C Serum\n3. Cleanser, Moisturizer, Vitamin C Serum\n4. Cleanser, Eye Cream\n5. Moisturizer, Eye Cream\nBundle A: {Cleanser} -> {Moisturizer}\nBundle B: {Cleanser} -> {Vitamin C Serum}", qs: ["Calculate the exact Lift for Bundle A.", "Calculate the exact Lift for Bundle B.", "Manager wants Bundle A because 75% buy it. Is manager right or wrong, and which bundle should you actually run?"] }
  ],
  [ // Section 3: CF
    { t: "Collaborative Filtering", body: "Target User (Sam): {Yoga Mat, Dumbbells}\nUser 1: {Yoga Mat, Dumbbells, Kettlebell, Resistance Bands}\nUser 2: {Yoga Mat, Dumbbells, Treadmill}\nUser 3: {Dumbbells, Kettlebell}\nUser 4: {Yoga Mat, Dumbbells, Kettlebell}\nItems: Kettlebell(50 lbs), Treadmill(150 lbs), Bands(2 lbs).\nConstraint: Valid peers need >= 2 identical items. No packages over 40 lbs.", qs: ["Based purely on the CF voting algorithm (ignoring weights), what item receives the most valid votes?", "What exact item does the system ultimately recommend as the backup?"] },
    { t: "Collaborative Filtering", body: "Target User (Leo - 15yo): {Console, Racing Game}\nUser 1: {Console, Racing Game, Zombie Shooter, Extra Controller}\nUser 2: {Console, Racing Game, Zombie Shooter}\nUser 3: {Racing Game, Extra Controller}\nUser 4: {Console, Racing Game, Headset}\nItems: Zombie Shooter(Rated 18+, $50), Extra Controller(All Ages, $70), Headset(All Ages, $40).\nConstraint: Valid peers need >= 2 identical items. No 18+ allowed. Tiebreaker: Cheaper.", qs: ["Based purely on the CF voting algorithm (ignoring age), what item receives the most valid votes?", "What exact item is ultimately recommended to Leo?"] },
    { t: "Collaborative Filtering", body: "Target User (Mia - Canada): {Action Movie A, Comedy Movie B}\nUser 1: {Action Movie A, Comedy Movie B, Sci-Fi Movie C, Drama Movie D}\nUser 2: {Action Movie A, Comedy Movie B, Sci-Fi Movie C}\nUser 3: {Comedy Movie B, Sci-Fi Movie C}\nUser 4: {Action Movie A, Comedy Movie B, Documentary E}\nItems: Sci-Fi C (Blocked in CA, Rating 7.0), Drama D (CA, Rating 8.2), Doc E (CA, Rating 9.1).\nConstraint: Valid peers need >= 2 identical items. No Geo-blocked items. Tiebreaker: Higher IMDB.", qs: ["Based purely on the CF voting algorithm (ignoring region locks), what movie receives the most valid votes?", "What exact movie is ultimately recommended to Mia?"] },
    { t: "Collaborative Filtering", body: "Target User (Emma - Peanut Allergy): {Milk, Bread, Eggs}\nUser 1: {Milk, Bread, Eggs, Peanut Butter, Apple}\nUser 2: {Milk, Bread, Peanut Butter, Almonds}\nUser 3: {Bread, Eggs, Orange Juice}\nUser 4: {Milk, Bread, Eggs, Apple, Almonds}\nItems: Peanut Butter(Peanuts, 190cal), Almonds(No Peanuts, 160cal), Apple(No Peanuts, 95cal).\nConstraint: Valid peers need >= 2 identical items. Skip peanuts. Tiebreaker: lower calorie count.", qs: ["Based purely on the CF voting algorithm (ignoring allergies), what item receives the most valid votes?", "What exact item is ultimately recommended to Emma?"] },
    { t: "Collaborative Filtering", body: "Target User (David - USB-C User): {iPhone 15, Phone Case}\nUser 1: {iPhone 15, Phone Case, AirPods, USB-C Charger}\nUser 2: {iPhone 15, Phone Case, Lightning Cable, AirPods}\nUser 3: {Phone Case, Screen Protector}\nUser 4: {iPhone 15, Phone Case, USB-C Charger, Lightning Cable}\nItems: Lightning Cable(Incompatible, Profit $10), AirPods(Compatible, Profit $30), USB-C Charger(Compatible, Profit $35).\nConstraint: Valid peers need >= 2 identical items. Skip Lightning. Tiebreaker: highest profit margin.", qs: ["Based purely on the CF voting algorithm (ignoring compatibility), what two items tie for the most valid votes?", "What exact item is ultimately recommended to David?"] },
    { t: "Collaborative Filtering", body: "Target User (Sarah - Summer): {T-Shirt, Jeans}\nUser 1: {T-Shirt, Jeans, Winter Coat, Sunglasses}\nUser 2: {T-Shirt, Jeans, Winter Coat, Sneakers}\nUser 3: {Jeans, Beanie}\nUser 4: {T-Shirt, Jeans, Sunglasses, Sneakers}\nItems: Winter Coat(Winter, Rating 4.9), Sunglasses(Summer, Rating 4.8), Sneakers(All-Season, Rating 4.9).\nConstraint: Valid peers need >= 2 identical items. Hide Winter Apparel. Tiebreaker: highest review score.", qs: ["Based purely on the CF voting algorithm (ignoring seasons), what item receives the most valid votes?", "What exact item is ultimately recommended to Sarah?"] }
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
  { t: "PySpark Data Processing", body: "def calculate_jaccard(set_A, set_B):\n  # Calculate the common items\n  common = len(set_A.[Blank 1](set_B))\n  # Calculate the total unique items\n  total = len(set_A.[Blank 2](set_B))\n  return common / total\n\nfrom pyspark.sql import SparkSession\nspark = SparkSession.builder.appName('EcomData').getOrCreate()\n# Load the 50GB dataset into Spark memory\ndf = spark.[Blank 3].[Blank 4]('sales_data.csv', [Blank 5]=True)" },
  { t: "Market Basket Analysis Code", body: "from mlxtend.frequent_patterns import apriori, association_rules\n# Run the algorithm and require items to appear in at least 10% of checkouts\nfrequent_items = [Blank 1](checkout_dataframe, [Blank 2]=0.10, use_colnames=True)\n# Calculate the rules using 'Lift' as our primary business metric\nbundle_rules = [Blank 3](frequent_items, [Blank 4]='lift', min_threshold=1.5)\n# Show the top 5 highest converting bundles\nprint(bundle_rules.[Blank 5](5))" },
  { t: "Customer Segmentation with K-Means", body: "from sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\n# Normalize data to fix the distance\nscaler = [Blank 1]()\nscaled_data = scaler.fit_transform(customer_data)\n# We want exactly 3 customer groups based on Elbow Method\nsegment_model = [Blank 2]([Blank 3]=3)\n# Feed the scaled data\nsegment_model.[Blank 4](scaled_data)\n# Assign customer group\ncustomer_data['Segment_ID'] = segment_model.[Blank 5](scaled_data)" },
  { t: "Item-Item Collaborative Filtering", body: "import pandas as pd\ndf_matrix = pd.read_csv('ratings_matrix.csv', index_col='User_ID')\n# Calculate the Pearson correlation between all products\nitem_similarity = df_matrix.[Blank 1]()\nmouse_sims = item_similarity['Wireless Mouse']\n# Remove 'Wireless Mouse' from the list\nmouse_sims = mouse_sims.[Blank 2]('Wireless Mouse')\n# Sort the remaining items from highest correlation\ntop_recs = mouse_sims.[Blank 3](ascending=[Blank 4])\n# Show the top 3 best items to recommend\nprint(top_recs.[Blank 5](3))" }
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
      alert("Please enter Name and Student ID");
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
    let content = "MIDTERM TEST SUBMISSION\n";
    content += "Name: " + name + "\n";
    content += "Student ID: " + studentId + "\n";
    content += "Time Taken: " + (90 - Math.floor(timeLeft / 60)) + " minutes\n";
    content += "-------------------------------------------------\n\n";

    content += "--- PART 1: THEORY ---\n";
    testData.p1.forEach((q, i) => {
      content += "Q" + (i+1) + ": " + q.text + "\n";
      content += "Answer: " + (answers["p1_" + i] || 'Not Answered') + "\n\n";
    });

    content += "--- PART 2: AUDIT ---\n";
    testData.p2.forEach((q, i) => {
      content += "AI Output: " + q.output + "\n";
      content += "Question: Q" + (i+1) + ": " + q.q + "\n";
      content += "Answer: " + (answers["p2_" + i] || 'Not Answered') + "\n\n";
    });

    content += "--- PART 3: MATH ---\n";
    testData.p3.forEach((q, i) => {
      content += "Scenario " + (i+1) + ": " + q.t + "\n";
      q.qs.forEach((subQ, j) => {
        content += "> Q" + (i+1) + "." + (j+1) + ": " + subQ + "\n";
        content += "Answer: " + (answers["p3_" + i + "_" + j] || 'Not Answered') + "\n";
      });
      content += "\n";
    });

    content += "--- PART 4: CODE EXECUTION ---\n";
    content += "Question 4: " + testData.p4.t + "\n";
    for(let i=1; i<=5; i++) {
      content += "Blank " + i + ": " + (answers["p4_" + i] || 'Not Answered') + "\n";
    }

    // Embed base64 grading key
    let keyObj = {
      p1: testData.p1.map(q => q.answer),
      p2: testData.p2.map(q => q.a)
    };
    content += "\n--- GRADING KEY (TEACHER ONLY) ---\n";
    content += btoa(JSON.stringify(keyObj));

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
        <h1 className="text-2xl font-bold mb-6">Midterm Assessment</h1>
        <p className="mb-4 text-sm text-slate-600">Enter your credentials to generate your specific exam variant. You will have 90 minutes to complete the test.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded" 
              value={name} onChange={e => setName(e.target.value)} 
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Student ID</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded" 
              value={studentId} onChange={e => setStudentId(e.target.value)} 
              placeholder="e.g. 123456"
            />
          </div>
          <button 
            onClick={startTest}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-slate-800 pb-32">
      <div className="flex justify-between items-center bg-white p-4 sticky top-0 border-b shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold">Midterm Test</h1>
          <p className="text-sm text-slate-500">{name} ({studentId})</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono font-bold text-red-600">
            {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
          </div>
          <p className="text-xs text-slate-500">Remaining</p>
        </div>
      </div>

      <div className="mt-8 space-y-12">
        {/* PART 1 */}
        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Part 1: Theory (35%)</h2>
          <p className="mb-4 text-sm">Match the scenarios to the appropriate concept.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 text-xs bg-slate-100 p-4 rounded">
            {CONCEPTS.map((c, i) => (
              <div key={i}>{c}</div>
            ))}
          </div>
          <div className="space-y-4">
            {testData.p1.map((q, i) => (
              <div key={i} className="bg-white p-4 rounded shadow-sm border">
                <p className="text-sm mb-2"><span className="font-bold">Q{i+1}:</span> {q.text}</p>
                <select 
                  className="w-full border p-2 rounded text-sm bg-slate-50"
                  value={answers["p1_" + i] || ''}
                  onChange={e => updateAnswer('p1', i, e.target.value)}
                >
                  <option value="">Select a concept...</option>
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
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Part 2: Audit (20%)</h2>
          <div className="space-y-4">
            {testData.p2.map((q, i) => (
              <div key={i} className="bg-white p-4 rounded shadow-sm border">
                <div className="bg-slate-100 p-3 rounded mb-3 text-sm italic border-l-4 border-blue-400">
                  {q.output}
                </div>
                <p className="font-bold text-sm mb-2">Q{i+1}: {q.q}</p>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded" 
                  placeholder="1-3 words answer"
                  value={answers["p2_" + i] || ''}
                  onChange={e => updateAnswer('p2', i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* PART 3 */}
        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Part 3: Math (30%)</h2>
          <div className="space-y-6">
            {testData.p3.map((q, i) => (
              <div key={i} className="bg-white p-4 rounded shadow-sm border">
                <h3 className="font-bold mb-2">Scenario {i+1}: {q.t}</h3>
                <pre className="text-xs bg-slate-100 p-3 rounded mb-4 whitespace-pre-wrap">{q.body}</pre>
                <div className="space-y-3">
                  {q.qs.map((subQ, j) => (
                    <div key={j}>
                      <p className="text-sm mb-1 font-semibold">Q{i+1}.{j+1}: {subQ}</p>
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
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Part 4: Code Execution (15%)</h2>
          <div className="bg-white p-4 rounded shadow-sm border">
            <h3 className="font-bold mb-2">Question 4: {testData.p4.t}</h3>
            <pre className="text-xs font-mono bg-slate-900 p-4 rounded mb-4 whitespace-pre-wrap overflow-x-auto text-white">
              {highlightPython(testData.p4.body)}
            </pre>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4,5].map(b => (
                <div key={b}>
                  <label className="block text-sm font-bold mb-1">Blank {b}</label>
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
          Finish & Download Submission File
        </button>
      </div>
    </div>
  );
}