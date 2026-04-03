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
  return highlighted;
};

const code = `def calculate_jaccard(set_A, set_B):
  # Calculate the common items
  common = len(set_A.[Blank 1](set_B))`;

console.log(highlightPython(code));