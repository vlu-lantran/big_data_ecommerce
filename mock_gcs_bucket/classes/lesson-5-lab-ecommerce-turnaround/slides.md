# Class 5 Lab (Standalone): The E-Commerce Turnaround Challenge

## Role and Constraints

- **Role:** Director of E-Commerce Strategy
- **Tools Allowed:** Jupyter Notebooks, ChatGPT, Gemini, GitHub Copilot
- **Time Limit:** 2 hours
- **Note:** This lesson page is guidance-only. Students must run and compute in their own notebooks.

---

## Scenario

You just inherited a large customer behavior dump: `customer_data_dump.csv`.

The company is losing margin from:
- inefficient marketing spend
- return-driven logistics losses

Your objective is to use **K-Means clustering** to:
- identify financially meaningful customer personas
- assign campaigns based on projected economics
- apply a zero-sum policy decision for operations

---

## Data Snippet (CSV Reference)

```csv
Customer_ID,Account_Age_Days,Total_Orders,Total_Gross_Spend,Reward_Points_Earned,Browser_Type,Days_Since_Last_Order,Total_Page_Views,Avg_Discount_Used,Email_Open_Rate,Return_Rate_Percent
CUST_004512,1140,3,34.50,31,Chrome,62,4102,0.65,0.88,0.05
CUST_008921,45,14,480.25,512,Safari,12,115,0.04,0.12,0.01
CUST_001024,890,1,22.10,20,Firefox,240,15,0.15,0.00,0.00
CUST_007633,320,8,160.75,170,Chrome,28,850,0.22,0.45,0.48
CUST_002199,1420,5,55.00,48,Edge,41,2100,0.50,0.92,0.09
```

---

## Part 1: Data Purge and Naming Ceremony

### Tasks

1. Select features that drive financial behavior.
2. Choose `k` and justify it (elbow, visual separation, or business practicality).
3. Name each cluster persona using centroid evidence.

### Hints

- Start with financial behavior columns:
  `Total_Gross_Spend`, `Total_Orders`, `Return_Rate_Percent`, `Avg_Discount_Used`, `Days_Since_Last_Order`.
- Explain why identifiers and vanity/noise columns were excluded.
- A useful `k` gives distinct, actionable personas without over-fragmenting.
- Persona labels should be evidence-based, not generic.

---

## Part 2: Merchandising Matrix (ROI Challenge)

Assign exactly one campaign to one cluster persona:
- **Campaign A:** Personalized AI-Generated Video SMS (`$2.00/user`, `5%` conversion)
- **Campaign B:** SMS Flash Sale 20% Off (`$0.10/user`, `15%` conversion)
- **Campaign C:** VIP Concierge Phone Call (`$10.00/user`, `25%` conversion)

### Formula Box

<div style="border:2px solid #1d4ed8; border-radius:12px; padding:12px; margin:10px 0; background:#eff6ff;">
  <strong>AOV Formula</strong><br />
  <code>AOV = Centroid Total Spend / Centroid Total Orders</code>
</div>

<div style="border:2px solid #0f766e; border-radius:12px; padding:12px; margin:10px 0; background:#ecfeff;">
  <strong>Projected Profit Formula</strong><br />
  <code>Projected Profit = (Cluster Size * Conversion Rate * AOV) - (Cluster Size * Campaign Cost)</code>
</div>

### Hints

- Do not default expensive campaigns to low-value clusters.
- Compare projected profit across candidate cluster assignments before finalizing.
- Some clusters receiving no campaign is acceptable.

---

## Part 3: Zero-Sum Policy Game (Operations)

Budget is zero-sum:
- choose one cluster for **Premium Policy** (free overnight shipping + free returns)
- choose one cluster for **Penalty Policy** (`$12` restocking fee)

### Formula Box

<div style="border:2px solid #7c3aed; border-radius:12px; padding:12px; margin:10px 0; background:#f5f3ff;">
  <strong>Return Bleed Formula</strong><br />
  <code>Return Bleed = Cluster Size * Centroid Total Orders * Centroid Return Rate * 12.00</code>
</div>

### Hints

- Premium policy should prioritize high-value, manageable-risk personas.
- Penalty policy should target clusters with strongest return-bleed impact.
- Use cluster size and centroid behavior together, not return rate in isolation.

Executive summary structure:

> We are penalizing **[Cluster X]** because our calculations show they are bleeding **$____** from our logistics budget. We will recover those funds and use them to pay for the VIP experience of **[Cluster Y]**.
