// Load and process the awards data
const rawData = require('../enhanced-honors-complete.json');

// Process and enhance the data
const awardsData = rawData.map(award => {
  // Clean up and standardize the data
  return {
    ...award,
    // Ensure year is a number or null
    year: award.year ? parseInt(award.year) : null,
    // Ensure boardgames is always an array
    boardgames: award.boardgames || [],
    // Add computed fields
    isWinner: award.title ? award.title.toLowerCase().includes('winner') : false,
    isNominee: award.title ? (award.title.toLowerCase().includes('nominee') || award.title.toLowerCase().includes('nom')) : false,
    // Clean up strings - handle null values
    title: award.title ? award.title.trim() : '',
    awardSet: award.awardSet ? award.awardSet.trim() : '',
    position: award.position ? award.position.trim() : ''
  };
});

// Create indices for faster searching
const awardsByYear = {};
const awardsByBggId = {};
const awardSets = new Set();
const categories = new Set();

awardsData.forEach(award => {
  // Index by year
  if (award.year) {
    if (!awardsByYear[award.year]) {
      awardsByYear[award.year] = [];
    }
    awardsByYear[award.year].push(award);
  }

  // Index by BGG ID
  award.boardgames.forEach(game => {
    if (!awardsByBggId[game.bggId]) {
      awardsByBggId[game.bggId] = [];
    }
    awardsByBggId[game.bggId].push(award);
  });

  // Collect unique award sets and categories
  if (award.awardSet) awardSets.add(award.awardSet);
  if (award.position) categories.add(award.position);
});

// Export processed data and indices
module.exports = awardsData;
module.exports.awardsByYear = awardsByYear;
module.exports.awardsByBggId = awardsByBggId;
module.exports.awardSets = Array.from(awardSets).sort();
module.exports.categories = Array.from(categories).sort();

// Statistics
console.log(`📊 Loaded ${awardsData.length} awards`);
console.log(`📅 Years: ${Object.keys(awardsByYear).length}`);
console.log(`🎮 Games: ${Object.keys(awardsByBggId).length}`);
console.log(`🏆 Award Sets: ${awardSets.size}`);
console.log(`📋 Categories: ${categories.size}`);
