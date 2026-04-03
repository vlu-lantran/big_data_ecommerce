I want you to create a module for Mid-term Test in this app. basically this module will receive input parameters from students and then generate a simple text file for them to download after they click submit. 
First the module will ask for the student's Full Name and Student ID.
After receive the ID, it will calculate the seed from that ID, using a formula.
Base on the ID, the students will be server random questions using below question bank.
Total time is 90 minutes.
Questions pool.
Part 1. theory - 35% total grade


Students will match the scenarios below to one of these 20 concepts:

Module 1: Data & Infrastructure
A. Volume (3Vs)
B. Velocity (3Vs)
C. Variety (3Vs)
D. Horizontal Scaling
E. Vertical Scaling
F. Distributed File System (DFS)
G. Apache Spark (In-Memory Processing)
H. Map-Reduce (Disk-Based Batch Processing)
I. Bonferroni Principle

Module 2: Intelligence & Grouping
J. K-Means Clustering
K. Hierarchical Clustering
L. The Curse of Dimensionality

Module 3: Recommendations
M. Content-Based Filtering
N. Collaborative Filtering
O. Cold Start Strategy

Module 4: SEO & Link Analysis
P. General SEO Practices
Q. PageRank Algorithm
R. Crawl Budget
S. Internal Linking
T. Bad Neighborhood / Link Spam

The 50 Scenarios Question Pool - Each scenario was attached with answer, this is for grading only, the student should not see this.
Category 1: Big Data & Infrastructure (Scenarios 1-22)

    [B. Velocity] Processing thousands of credit card swipes and adjusting inventory counts every single millisecond during a Black Friday flash sale.

    [C. Variety] The data lake ingestion pipeline crashes because it suddenly receives a mix of structured SQL tables, unstructured JPEG images, and raw text reviews.

    [A. Volume] A clothing retailer realizes their legacy database cannot physically hold the 10 petabytes of historical clickstream data generated over the last five years.

    [D. Horizontal Scaling] To handle the holiday rush, the DevOps team adds 50 new, relatively cheap commodity web servers to the existing cluster to share the traffic load.

    [E. Vertical Scaling] Upgrading your single, central monolithic database server by replacing its 128GB of RAM with 512GB of RAM to handle larger queries.

    [F. DFS] Splitting a massive 500GB server log file into 128MB chunks and spreading those blocks across 10 different physical hard drives for storage.

    [G. Apache Spark] An analyst abandons Excel because it freezes at 1 million rows, moving to a modern framework that distributes the dataframe entirely across a cluster's RAM to avoid slow hard-drive reads.

    [H. Map-Reduce] A legacy data pipeline that reads from the disk, processes a batch of data, writes the intermediate results back to the hard drive, and repeats this slow process for hours.

    [I. Bonferroni Principle] A data team flags 50,000 normal shoppers as "fraudsters" because their algorithm looked for so many random behavioral overlaps that it found statistical "patterns" that were actually just random chance.

    [B. Velocity] A real-time dashboard that updates warehouse delivery logistics the exact moment a delivery truck passes a GPS checkpoint.

    [C. Variety] Trying to join a strict relational database of user profiles with a stream of emojis and messy slang from a TikTok social listening API.

    [A. Volume] Realizing that storing every single mouse movement of every user on your site will require transitioning from megabytes to terabytes of storage daily.

    [D. Horizontal Scaling] E-commerce traffic drops in January, so the cloud provider automatically shuts down 20 redundant virtual machines to save costs without taking the site offline.

    [E. Vertical Scaling] Buying the absolute most expensive, top-tier processor from Intel to replace the old CPU in your single backend server.

    [F. DFS] A server catches fire, but the system stays online with no data lost because the data blocks were automatically replicated across three other nodes upon ingestion.

    [G. Apache Spark] Using a modern execution engine to run real-time machine learning models because it caches the working data in-memory rather than relying on disk I/O.

    [H. Map-Reduce] Using a Hadoop framework to process log files where processing speed is not an issue, but extreme fault tolerance during the slow, sequential disk-writing phases is required.

    [I. Bonferroni Principle] Calculating the probability of rare events occurring together to prove to the marketing director that her new "insight" is mathematically useless due to a massive sample size.

    [D. Horizontal Scaling] The core philosophy of "The Technology of Scale": Instead of buying one supercomputer, Shopee uses thousands of standard computers working together.

    [G. Apache Spark] Utilizing DataFrames in a distributed environment to execute a query 100x faster than legacy Hadoop systems.

    [H. Map-Reduce] A daily batch job that takes 8 hours to run overnight, relying heavily on mapping data to keys and reducing them down, writing to disk at every step.

    [I. Bonferroni Principle] You search a database of 1 billion transactions looking for any two users who made the exact same purchases on the exact same days. You find a match, but realize it doesn't mean they are conspiring together; it's just a statistical inevitability.

Category 2: Clustering (Scenarios 23-30)

    [J. K-Means Clustering] The analyst pre-defines that they want exactly 4 customer segments, and the algorithm continuously moves the center points until all customers are grouped into those 4 buckets based on spending habits.

    [K. Hierarchical Clustering] Building a visual "dendrogram" (tree diagram) to see how individual product categories naturally merge into larger departments, without deciding the number of groups in advance.

    [L. Curse of Dimensionality] Adding 500 new tracking metrics to the customer database, causing the mathematical distance between all customers to look practically identical, which breaks your segmentation model.

    [J. K-Means Clustering] Grouping delivery addresses into 5 regional dispatch zones based solely on their physical latitude and longitude coordinates.

    [K. Hierarchical Clustering] The system starts by treating every single product as its own distinct cluster, and slowly merges the two most similar products step-by-step until there is only one massive cluster left.

    [L. Curse of Dimensionality] A data scientist insists on finding similar users based on 10,000 different behavioral tags, resulting in a sparse matrix where distance calculations become meaningless.

    [J. K-Means Clustering] Using the "Elbow Method" to figure out that k=3 is the optimal number of spending tiers for your VIP program before running the algorithm.

    [L. Curse of Dimensionality] The core reason why data analysts must use Principal Component Analysis (PCA) to reduce the number of features before attempting to find similarities in massive datasets.

Category 3: Recommendation Systems (Scenarios 31-38)

    [M. Content-Based Filtering] Recommending a "Red Nike Running Shoe" because the user previously purchased a "Blue Nike Running Shoe."

    [N. Collaborative Filtering] User A and User B both bought a laptop and a mouse. User A buys a keyboard. The system recommends a keyboard to User B.

    [O. Cold Start Strategy] A user downloads the app for the very first time, so the system displays the generic "Top Selling Items in your Country" until they click on something.

    [M. Content-Based Filtering] A shopper adds a "Vegan, Gluten-Free" snack to their cart, so the system filters the catalog metadata to show only other items tagged with "Vegan" and "Gluten-Free".

    [N. Collaborative Filtering] The system ignores the actual product descriptions entirely and relies purely on the mathematical user-item interaction matrix to find behavioral patterns.

    [O. Cold Start Strategy] A brand new merchant uploads a custom handmade wallet, but because nobody has bought it yet, the recommendation engine cannot rely on user history to promote it.

    [M. Content-Based Filtering] Analyzing the tags, categories, and TF-IDF scores of a movie's description to recommend a conceptually similar movie.

    [N. Collaborative Filtering] The classic Amazon model: "People who bought this TV also bought this HDMI cable."

Category 4: SEO & Link Analysis (Scenarios 39-50)

    [Q. PageRank] Google determines that a link pointing to your store from CNN.com has significantly more mathematical weight than a link from your cousin's personal blog.

    [R. Crawl Budget] A massive marketplace has 50 million product pages, but Googlebot only has the server resources to index 2 million of them per day.

    [S. Internal Linking] Ensuring every single product page on your website links back up to its parent category page so search engines can understand your site's hierarchy.

    [T. Bad Neighborhood] Your search ranking drops off a cliff overnight because you bought cheap backlinks that were placed on a forum known for hosting malware.

    [P. General SEO Practices] The overarching technical and marketing practice of optimizing page titles, loading speeds, and keywords to rank higher in organic search results.

    [Q. PageRank] An algorithm that simulates a "random surfer" clicking links endlessly across the web to calculate the probability of landing on one specific web page.

    [R. Crawl Budget] Using the robots.txt file to block Google from reading your useless user-login and shopping cart pages, saving its limited time for your actual product pages.

    [S. Internal Linking] Creating a "Related Products" widget at the bottom of the page, intentionally passing ranking power from a high-traffic item to a lesser-known item on your own domain.

    [T. Bad Neighborhood] Trying to cheat the system by buying a package of 10,000 automated backlinks from a "link farm" network, resulting in your domain being blacklisted.

    [Q. PageRank] The original mathematical foundation that made Google superior to early search engines by treating links as weighted "votes" of influence.

    [P. General SEO Practices] Adding alt-text to product images and ensuring the site is mobile-friendly to appease search engine algorithms.

    [R. Crawl Budget] Eliminating duplicate content and infinite calendar loops so Googlebot doesn't waste its allocated server requests getting stuck on useless pages.

Part 2. - Audit - 20% total grade

Here are 20 distinct, e-commerce-focused scenarios covering entire syllabus. The answers are kept strictly to 1 to 3 words. Each question was attached with answer, this is for grading only, the student should not see this.
The AI Audit Question Bank (20 Scenarios)

Module 1: Infrastructure, Scale, & The 3Vs

    AI Output: "To prepare for the 11.11 Flash Sale traffic, we should just buy the single most expensive, powerful mainframe server on the market."

        Question: What two-word scaling strategy is the actual e-commerce industry standard instead?

        Answer: Horizontal Scaling

    AI Output: "We need to process live fraud-detection algorithms while the user is checking out. Let's use Hadoop Map-Reduce to save the data to the hard drive at every step."

        Question: What modern, in-memory framework should the data team use instead for real-time speed?

        Answer: Apache Spark

    AI Output: "Our transaction volume is growing. Let's load the 50 million rows of log data into Microsoft Excel for the marketing team to analyze."

        Question: What Big Data concept (starting with V) explains why Excel will instantly crash here?

        Answer: Volume

    AI Output: "The system is struggling to store 10 Petabytes of product videos on one database. Let's buy a bigger hard drive."

        Question: What three-word technology distributes massive files across thousands of standard hard drives?

        Answer: Distributed File System (or DFS)

    AI Output: "Our live inventory dashboard updates once every 24 hours via a batch job."

        Question: Which of the "3Vs" of Big Data is this batch job failing to address?

        Answer: Velocity

    AI Output: "We must build a strict SQL relational database to hold all our data, including rigid tables, unstructured TikTok review videos, and raw JSON logs."

        Question: Which of the "3Vs" makes a rigid SQL database a bad choice for this mix of data types?

        Answer: Variety

Module 2: Market Basket & Statistical Traps

    AI Output: "Out of 1 billion shoppers, I found 5 people who bought the exact same 12 random items on a Tuesday. They must be a coordinated fraud ring!"

        Question: What two-word statistical principle proves this is just a random mathematical inevitability?

        Answer: Bonferroni Principle

    AI Output: "We found a strong association rule: {Gaming PC} → {Mousepad}. We should heavily discount the Gaming PC to sell more Mousepads."

        Question: Which item (PC or Mousepad) should actually receive the discount to maximize profit?

        Answer: Mousepad

    AI Output: "To find the best bundles, let's calculate the Lift for every single possible combination of our 5 million products simultaneously!"

        Question: What specific algorithm must we run first to delete the rare items and save computing power?

        Answer: A-Priori (or A-Priori Algorithm)

    AI Output: "The Confidence for {Socks} → {Shoes} is high, but the overall metric showing how often they are bought together out of all transactions is only 0.001."

        Question: What one-word Market Basket metric is the AI describing as being 0.001?

        Answer: Support

Module 3: Clustering & Segmentation

    AI Output: "Our K-Means customer segmentation model grouped a student who spent $10 and a VIP who spent $10,000 into the exact same cluster."

        Question: What crucial data preparation step was forgotten before running the distance calculations?

        Answer: Scaling (or Normalization)

    AI Output: "To make our clustering perfectly accurate, let's use all 15,000 available tracking variables at once to calculate the distance between users."

        Question: What three-word mathematical concept proves this will actually make all users look equally far apart?

        Answer: Curse of Dimensionality

    AI Output: "I want to automatically organize our 50,000 loose products into a branching category tree (e.g., Electronics → Phones → Apple), so I will use K-Means."

        Question: What specific type of clustering should be used to build this nested tree structure?

        Answer: Hierarchical Clustering

    AI Output: "We are going to use K-Means Clustering to group our shoppers, but we have absolutely no idea how many groups we should divide them into."

        Question: What two-word visual method should the analyst use to find the optimal 'K'?

        Answer: Elbow Method

Module 4: Recommendations & De-Duplication

    AI Output: "We have a brand new user who just registered 5 seconds ago. Let's use Collaborative Filtering to recommend products based on their past purchase history."

        Question: What three-word strategy must be used instead when a user has no history?

        Answer: Cold Start Strategy

    AI Output: "The Jaccard Similarity score between {Samsung, S24, Ultra, 512GB} and {Samsung, S24, Ultra, 512GB, Case} is 0.80. We should automatically merge them into one listing."

        Question: State the exact word in the second set that proves merging these will cause massive customer refunds.

        Answer: Case

    AI Output: "User A bought a tent. To recommend something else, let's find other users who bought tents and see what else they bought."

        Question: What two-word recommendation strategy is the AI describing here?

        Answer: Collaborative Filtering

    AI Output: "User A bought a tent. To recommend something else, let's scan the product tags (Outdoor, Camping, Nylon) and find another item with the exact same tags."

        Question: What recommendation strategy is the AI describing here?

        Answer: Content-Based Filtering

Module 5: SEO & Link Analysis

    AI Output: "To improve our search ranking quickly, the marketing team should buy 5,000 links from empty, automated blog sites."

        Question: What specific Google algorithm update detects and penalizes this "bad neighborhood" tactic?

        Answer: TrustRank

    AI Output: "We have an infinite calendar widget on our site that generates millions of useless date URLs. Googlebot is getting stuck reading them and ignoring our actual products."

        Question: What two-word SEO concept describes the limited amount of time a search engine allocates to scanning your site?

        Answer: Crawl Budget

Part 3. Math - 30% total grade
This part will have 3 sections. Every student will be server random 1 out those variations in each sections. Again, answer is for my grading later, student no need to see this.
Section 1. Jaccard Similarity Pool (The "Destructive Merge" Scenarios)
Variation 1: The Title Length Rule

The Scenario: Your automated catalog system merges any two products if their Jaccard Similarity score is 0.80 or higher. When a merge happens, the system automatically deletes the Product ID that has the fewer total words in its title to keep the most descriptive listing.
The Data:

    ID 101: {Samsung, Galaxy, S24, Ultra, 512GB, Black}

    ID 102: {Samsung, Galaxy, S24, Ultra, 512GB, Black, Unlocked}

    ID 103: {Samsung, Galaxy, S23, Ultra, 512GB, Black}

The Questions for the Student:

    What is the Jaccard Similarity score between ID 101 and ID 102? (Provide fraction or decimal)

    Based on the business rule, which exact Product ID (101, 102, or 103) is permanently deleted from the database today?

    Fast Grading Key:

        Answer 1: 6/7 (or ~0.85). (Intersection is 6 words, Union is 7 words).

        Answer 2: ID 101. (It crosses the 0.80 threshold, and 101 has 6 words while 102 has 7 words, so the shorter one is deleted).

Variation 2: The Pricing Error Rule

The Scenario: Third-party sellers keep uploading duplicate items with slightly different prices. Your system merges any two products if their Jaccard Similarity score is strictly greater than 0.75. To protect buyers, when a merge happens, the system deletes the Product ID with the more expensive price.
The Data:

    ID 201: {Nike, Air, Max, 90, Running, Shoe} - Price: $120

    ID 202: {Nike, Air, Max, 90, Running, Shoe, White} - Price: $125

    ID 203: {Nike, Air, Zoom, Pegasus, Running, Shoe} - Price: $110

The Questions for the Student:

    What is the Jaccard Similarity score between ID 201 and ID 202? (Provide fraction or decimal)

    Based on the business rule, which exact Product ID (201, 202, or 203) is permanently deleted from the database today?

    Fast Grading Key:

        Answer 1: 6/7 (or ~0.85).

        Answer 2: ID 202. (It crosses the >0.75 threshold, and ID 202 costs $125 vs $120, so the expensive one is deleted).

Variation 3: The Legal Compliance Rule

The Scenario: Your system combines inventory counts for any two products if their Jaccard Similarity score is 0.80 or higher. However, if one of the merged items contains the word "Refurbished", the final combined listing MUST retain the "Refurbished" tag to avoid lawsuits from customers expecting brand new items.
The Data:

    ID 301: {Apple, MacBook, Pro, M3, 16GB, 1TB} - (Stock: 5)

    ID 302: {Apple, MacBook, Pro, M3, 16GB, 1TB, Refurbished} - (Stock: 2)

    ID 303: {Apple, MacBook, Air, M3, 16GB, 1TB} - (Stock: 10)

The Questions for the Student:

    What is the Jaccard Similarity score between ID 301 and ID 302? (Provide fraction or decimal)

    After the automated system runs, what is the exact total Stock count of the "Refurbished" listing?

    Fast Grading Key:

        Answer 1: 6/7 (or ~0.85).

        Answer 2: 7. (301 and 302 cross the threshold and merge. 5 + 2 = 7. Because 302 has the word Refurbished, the combined stock of 7 takes that legal tag).

Section 2: Market Basket Analysis Pool (The "Budget Cannibalization" Scenarios)
Variation 1: The PC Gamer Trap

The Scenario: You have a $500 marketing budget to promote one new bundle on your homepage. The junior analyst proposes two options based on the latest 5 checkouts.
The Data (5 Checkouts):

    Laptop, Wireless Mouse, Keyboard

    Laptop, Wireless Mouse

    Laptop, Keyboard

    Laptop, Wireless Mouse

    Wireless Mouse, Headset

The Proposed Bundles:

    Bundle A: Buy a {Laptop}, get a discount on a {Wireless Mouse}.

    Bundle B: Buy a {Laptop}, get a discount on a {Keyboard}.

The Questions for the Student:

    Calculate the exact Lift for Bundle A. (Show as a decimal)

    Calculate the exact Lift for Bundle B. (Show as a decimal)

    The Business Decision: Based on your calculations, which bundle (A or B) is actually just cannibalizing organic sales, and which bundle should receive the $500 marketing budget to drive new revenue?

    Fast Grading Key:

        Answer 1 (Bundle A Lift): 0.93 (Support Laptop = 4/5. Support Mouse = 4/5. Support Both = 3/5. Confidence = 3/4 (0.75). Lift = 0.75 / 0.8 = 0.9375).

        Answer 2 (Bundle B Lift): 1.25 (Support Laptop = 4/5. Support Keyboard = 2/5. Support Both = 2/5. Confidence = 2/4 (0.50). Lift = 0.50 / 0.4 = 1.25).

        Answer 3: Bundle A is cannibalizing. Bundle B gets the budget. (Lift < 1 means they act as substitutes or independent purchases; discounting the mouse loses money. Lift > 1 means the laptop actually drives keyboard sales).

Variation 2: The Winter Apparel Trap

The Scenario: Your clothing brand wants to launch a winter bundle. You have a $5,000 ad budget. The AI system recommends two bundles based on the sample data below.
The Data (5 Checkouts):

    Winter Coat, Snow Boots, Wool Scarf

    Winter Coat, Snow Boots, Wool Scarf

    Winter Coat, Snow Boots

    Snow Boots, Gloves

    Snow Boots, Winter Hat

The Proposed Bundles:

    Bundle A: Buy a {Winter Coat}, get a discount on {Snow Boots}.

    Bundle B: Buy a {Winter Coat}, get a discount on a {Wool Scarf}.

The Questions for the Student:

    Calculate the exact Lift for Bundle A. (Show as a decimal)

    Calculate the exact Lift for Bundle B. (Show as a decimal)

    The Business Decision: The AI strongly recommends Bundle A because its Confidence is 100%. Explain in ONE sentence why the AI's pricing strategy is wrong, and state which bundle actually gets the ad budget.

    Fast Grading Key:

        Answer 1 (Bundle A Lift): 1.0 (Support Coat = 3/5. Support Boots = 5/5. Support Both = 3/5. Confidence = 3/3 (1.0). Lift = 1.0 / 1.0 = 1.0).

        Answer 2 (Bundle B Lift): 1.66 (Support Coat = 3/5. Support Scarf = 2/5. Support Both = 2/5. Confidence = 2/3 (0.66). Lift = 0.66 / 0.4 = 1.66).

        Answer 3: Bundle B gets the budget. (A Lift of 1.0 for Bundle A means the Coat has absolutely no effect on Boot sales; everyone is buying boots anyway, so a discount wastes money).

Variation 3: The Skincare Routine Trap

The Scenario: Your cosmetics brand is launching a promotional email campaign. You must pick one pair of items to feature together.
The Data (5 Checkouts):

    Cleanser, Moisturizer

    Cleanser, Moisturizer, Vitamin C Serum

    Cleanser, Moisturizer, Vitamin C Serum

    Cleanser, Eye Cream

    Moisturizer, Eye Cream

The Proposed Bundles:

    Bundle A: {Cleanser} → {Moisturizer}

    Bundle B: {Cleanser} → {Vitamin C Serum}

The Questions for the Student:

    Calculate the exact Lift for Bundle A. (Show as a decimal)

    Calculate the exact Lift for Bundle B. (Show as a decimal)

    The Business Decision: Your manager wants to run Bundle A because "75% of people who buy the Cleanser also buy the Moisturizer." Based on your Lift calculations, is the manager right or wrong, and which bundle should you actually run?

    Fast Grading Key:

        Answer 1 (Bundle A Lift): 0.93 (Support Cleanser = 4/5. Support Moizturizer = 4/5. Support Both = 3/5. Confidence = 3/4 (0.75). Lift = 0.75 / 0.8 = 0.9375).

        Answer 2 (Bundle B Lift): 1.25 (Support Cleanser = 4/5. Support Serum = 2/5. Support Both = 2/5. Confidence = 2/4 (0.50). Lift = 0.50 / 0.4 = 1.25).

        Answer 3: Manager is wrong. Run Bundle B. (Bundle A's Lift is < 1, meaning they are cannibalizing each other / bought independently. Bundle B's Lift > 1 shows a true complementary relationship).

Section 3: Collaborative Filtering Pool (The "Constraint" Scenarios)

The Core CF Rules (Printed at the top of the section for the student):
Your e-commerce engine uses a simplified User-User Collaborative Filtering algorithm to recommend exactly one new item to a Target User. The algorithm works in 3 strict steps:

    Identify Peers: Look at the other users. A user is only considered a "Valid Peer" if they share at least 2 identical past purchases with the Target User. (Ignore anyone who shares fewer than 2).

    Tally Votes: Look at the new items bought by these Valid Peers. Tally how many Valid Peers bought each new item.

    Recommend: Recommend the item with the highest tally.

Variation 1: The Heavy Freight Twist (Fitness Gear)

The Scenario: You need to recommend an item to the Target User, Sam. Sam lives in a 5th-floor apartment with a strict delivery rule: No single package over 40 lbs. The Data:

    Target User (Sam): {Yoga Mat, Dumbbells}

    User 1: {Yoga Mat, Dumbbells, Kettlebell, Resistance Bands}

    User 2: {Yoga Mat, Dumbbells, Treadmill}

    User 3: {Dumbbells, Kettlebell}

    User 4: {Yoga Mat, Dumbbells, Kettlebell}

Item Weights: Kettlebell (50 lbs), Treadmill (150 lbs), Resistance Bands (2 lbs).

The Questions for the Student:

    Based purely on the CF voting algorithm (ignoring weights), what item receives the most valid votes?

    Business Decision: The system automatically skips any item that violates Sam's apartment weight limit. What exact item does the system ultimately recommend as the backup?

    Fast Grading Key:

        Answer 1: Kettlebell. (Valid Peers are 1, 2, and 4. User 3 is invalid. Kettlebell gets 2 valid votes).

        Answer 2: Resistance Bands. (Kettlebell wins but is too heavy. Treadmill gets 1 vote but is too heavy. Resistance Bands gets 1 vote and is light enough).

Variation 2: The Age-Gate Twist (Video Games)

The Scenario: You need to recommend an item to the Target User, Leo. Leo's account is registered as a 15-year-old. The system legally cannot recommend any item rated "Mature 18+". If there is a tie for the backup recommendation, the system defaults to the cheaper item.
The Data:

    Target User (Leo): {Console, Racing Game}

    User 1: {Console, Racing Game, Zombie Shooter, Extra Controller}

    User 2: {Console, Racing Game, Zombie Shooter}

    User 3: {Racing Game, Extra Controller}

    User 4: {Console, Racing Game, Headset}

Item Details: Zombie Shooter (Rated 18+, $50), Extra Controller (Rated All Ages, $70), Headset (Rated All Ages, $40).

The Questions for the Student:

    Based purely on the CF voting algorithm (ignoring age), what item receives the most valid votes?

    Business Decision: Applying the age restriction and the tie-breaker rule, what exact item is ultimately recommended to Leo?

    Fast Grading Key:

        Answer 1: Zombie Shooter. (Valid Peers are 1, 2, and 4. User 3 is invalid. Zombie Shooter gets 2 valid votes).

        Answer 2: Headset. (Zombie Shooter wins but is age-blocked. Controller and Headset tie for 2nd with 1 vote each. Headset wins the tie-breaker because $40 < $70).

Variation 3: The Region Block Twist (Digital Streaming)

The Scenario: You need to recommend a movie to Target User, Mia. Mia is located in Canada. Due to licensing laws, the system cannot recommend movies that are geo-blocked in Canada. If there is a tie for the backup recommendation, the system defaults to the movie with the higher IMDB rating.
The Data:

    Target User (Mia): {Action Movie A, Comedy Movie B}

    User 1: {Action Movie A, Comedy Movie B, Sci-Fi Movie C, Drama Movie D}

    User 2: {Action Movie A, Comedy Movie B, Sci-Fi Movie C}

    User 3: {Comedy Movie B, Sci-Fi Movie C}

    User 4: {Action Movie A, Comedy Movie B, Documentary E}

Item Details: * Sci-Fi Movie C (Geo-blocked in Canada, Rating: 7.0)

    Drama Movie D (Available in Canada, Rating: 8.2)

    Documentary E (Available in Canada, Rating: 9.1)

The Questions for the Student:

    Based purely on the CF voting algorithm (ignoring region locks), what movie receives the most valid votes?

    Business Decision: Applying the region block and the tie-breaker rule, what exact movie is ultimately recommended to Mia?

    Fast Grading Key:

        Answer 1: Sci-Fi Movie C. (Valid Peers are 1, 2, and 4. User 3 is invalid. Sci-Fi C gets 2 valid votes).

        Answer 2: Documentary E. (Sci-Fi C wins but is blocked. Drama D and Doc E tie with 1 vote each. Doc E wins the tie-breaker due to a 9.1 vs 8.2 rating).

Variation 4: The Allergy Twist (Groceries)

The Scenario: Target User, Emma, has a strict dietary filter turned on for a Peanut Allergy. The system must automatically skip any item that contains peanuts. If there is a tie for the backup item, the system defaults to the item with the lower calorie count.
The Data:

    Target User (Emma): {Milk, Bread, Eggs}

    User 1: {Milk, Bread, Eggs, Peanut Butter, Apple}

    User 2: {Milk, Bread, Peanut Butter, Almonds}

    User 3: {Bread, Eggs, Orange Juice} (Note: Only 2 items. Are they valid?)

    User 4: {Milk, Bread, Eggs, Apple, Almonds}

Item Details: * Peanut Butter (Contains Peanuts, 190 cal)

    Almonds (No Peanuts, 160 cal)

    Apple (No Peanuts, 95 cal)

The Questions:

    Based purely on the CF voting algorithm (ignoring allergies), what item receives the most valid votes?

    Applying the allergy constraint and tie-breaker rule, what exact item is ultimately recommended to Emma?

Fast Grading Key:

    Answer 1: Peanut Butter (Valid peers are 1, 2, 3, 4. Peanut Butter gets 2 votes. Apple gets 2. Almonds gets 2. It's a 3-way tie for the base votes).

    Answer 2: Apple (Peanut Butter is skipped due to allergies. Apple and Almonds tie with 2 votes each. Apple wins the tie-breaker because 95 cal < 160 cal).

Variation 5: The Compatibility Twist (Electronics)

The Scenario: Target User, David, just bought an iPhone 15, which uses a USB-C charging port. The system is programmed to never recommend Lightning cables to USB-C users. If there is a tie, the system defaults to the item with the highest profit margin.
The Data:

    Target User (David): {iPhone 15, Phone Case}

    User 1: {iPhone 15, Phone Case, AirPods, USB-C Charger}

    User 2: {iPhone 15, Phone Case, Lightning Cable, AirPods}

    User 3: {Phone Case, Screen Protector}

    User 4: {iPhone 15, Phone Case, USB-C Charger, Lightning Cable}

Item Details: * Lightning Cable (Incompatible, Profit $10)

    AirPods (Compatible, Profit $30)

    USB-C Charger (Compatible, Profit $35)

The Questions:

    Based purely on the CF voting algorithm (ignoring compatibility), what two items tie for the most valid votes?

    Applying the compatibility constraint and tie-breaker rule, what exact item is ultimately recommended to David?

Fast Grading Key:

    Answer 1: AirPods and USB-C Charger and Lightning Cable (Wait, all three actually get 2 votes. User 3 is invalid (only 1 match). Users 1, 2, 4 are valid).

    Answer 2: USB-C Charger (Lightning is skipped. AirPods and USB-C tie. USB-C wins because $35 > $30).

Variation 6: The Seasonal Twist (Apparel)

The Scenario: Target User, Sarah, is shopping in July (Summer). The system automatically hides any item tagged "Winter Apparel". If there is a tie for the backup recommendation, the system defaults to the item with the highest customer review score.
The Data:

    Target User (Sarah): {T-Shirt, Jeans}

    User 1: {T-Shirt, Jeans, Winter Coat, Sunglasses}

    User 2: {T-Shirt, Jeans, Winter Coat, Sneakers}

    User 3: {Jeans, Beanie}

    User 4: {T-Shirt, Jeans, Sunglasses, Sneakers}

Item Details: * Winter Coat (Tagged Winter, Rating 4.9)

    Sunglasses (Tagged Summer, Rating 4.8)

    Sneakers (Tagged All-Season, Rating 4.9)

The Questions:

    Based purely on the CF voting algorithm (ignoring seasons), what item receives the most valid votes?

    Applying the seasonal constraint and tie-breaker rule, what exact item is ultimately recommended to Sarah?

Fast Grading Key:

    Answer 1: Winter Coat AND Sunglasses AND Sneakers (All three get 2 valid votes from Users 1, 2, and 4. User 3 is invalid).

    Answer 2: Sneakers (Coat is skipped. Sunglasses and Sneakers tie with 2 votes. Sneakers win the tie-breaker because 4.9 > 4.8).

Part 4. The Code Execution Pool (Randomized Scripts) - 15% total grade

Variation 1: The Jaccard & PySpark Engineer

(Tests Class 2 and Class 3 concepts)
Instructions: You are analyzing product similarities and loading a massive sales dataset. Fill in the 5 missing commands [Blank 1] through [Blank 5] to make this Colab script run.

# --- 1. Jaccard Similarity ---
def calculate_jaccard(set_A, set_B):
    # Calculate the common items
    common = len(set_A.[Blank 1](set_B))
    
    # Calculate the total unique items
    total = len(set_A.[Blank 2](set_B))
    
    return common / total

# --- 2. PySpark Big Data Loading ---
from pyspark.sql import SparkSession
spark = SparkSession.builder.appName("EcomData").getOrCreate()

# Load the 50GB dataset into Spark memory
df = spark.[Blank 3].[Blank 4]("sales_data.csv", [Blank 5]=True)

Variation 2: The Market Basket Analyst

(Tests Class 4 concepts)
Instructions: You are using the Python mlxtend library in Colab to find product bundles (Beer & Diapers). Fill in the 5 missing commands [Blank 1] through [Blank 5] to make this script run.
from mlxtend.frequent_patterns import apriori, association_rules

# --- 1. Find Frequent Itemsets ---
# Run the algorithm and require items to appear in at least 10% of checkouts
frequent_items = [Blank 1](checkout_dataframe, [Blank 2]=0.10, use_colnames=True)

# --- 2. Generate the Bundle Rules ---
# Calculate the rules using "Lift" as our primary business metric
bundle_rules = [Blank 3](frequent_items, [Blank 4]="lift", min_threshold=1.5)

# --- 3. View the Results ---
# Show the top 5 highest converting bundles
print(bundle_rules.[Blank 5](5))

Variation 3: The VIP Customer Segmenter

(Tests Class 5 concepts)
Instructions: You are using the sklearn library in Colab to group your customers into "VIPs", "Regulars", and "Discount Hunters". Fill in the 5 missing commands [Blank 1] through [Blank 5].
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# --- 1. Prepare the Data ---
# Customers who spend $10 vs $10,000 must be normalized first to fix the distance!
scaler = [Blank 1]()
scaled_data = scaler.fit_transform(customer_data)

# --- 2. Build the Clustering Model ---
# We want exactly 3 customer groups based on our Elbow Method analysis
segment_model = [Blank 2]([Blank 3]=3)

# --- 3. Run the Algorithm ---
# Feed the scaled data into the algorithm to let it learn the patterns
segment_model.[Blank 4](scaled_data)

# --- 4. Get the Results ---
# Assign each customer their new VIP / Regular / Discount group number
customer_data['Segment_ID'] = segment_model.[Blank 5](scaled_data)

Variation 4: The Item-Item CF Engine

(Tests Class 7: Item-Based Collaborative Filtering)
Instructions: You are using Python and Pandas to calculate which products are most frequently bought together based on user rating patterns. Fill in the 5 missing commands [Blank 1] through [Blank 5].
import pandas as pd

# --- 1. Load the User-Item Matrix ---
# Users are rows, Products are columns.
df_matrix = pd.read_csv("ratings_matrix.csv", index_col="User_ID")

# --- 2. Calculate Item Similarity ---
# Calculate the Pearson correlation between all products in the catalog
item_similarity = df_matrix.[Blank 1]()

# --- 3. Generate a Recommendation ---
# A user just added "Wireless Mouse" to their cart. Look up its similarity column.
mouse_sims = item_similarity["Wireless Mouse"]

# Remove "Wireless Mouse" from the list so we don't recommend the exact same item
mouse_sims = mouse_sims.[Blank 2]("Wireless Mouse")

# Sort the remaining items from highest correlation score to lowest
top_recs = mouse_sims.[Blank 3](ascending=[Blank 4])

# Show the top 3 best items to recommend
print(top_recs.[Blank 5](3))