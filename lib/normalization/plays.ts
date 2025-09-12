export enum PlayCategory {
  COMEDY = 'COMEDY',
  HISTORY = 'HISTORY', 
  TRAGEDY = 'TRAGEDY',
  ROMANCE = 'ROMANCE',
  OTHER = 'OTHER',
}

export enum CanonicalPlay {
  // Comedies
  ALL_S_WELL_THAT_ENDS_WELL = 'ALL_S_WELL_THAT_ENDS_WELL',
  AS_YOU_LIKE_IT = 'AS_YOU_LIKE_IT',
  COMEDY_OF_ERRORS = 'COMEDY_OF_ERRORS',
  CYMBELINE = 'CYMBELINE',
  LOVE_S_LABOUR_S_LOST = 'LOVE_S_LABOUR_S_LOST',
  MEASURE_FOR_MEASURE = 'MEASURE_FOR_MEASURE',
  MERCHANT_OF_VENICE = 'MERCHANT_OF_VENICE',
  MERRY_WIVES_OF_WINDSOR = 'MERRY_WIVES_OF_WINDSOR',
  MIDSUMMER_NIGHT_S_DREAM = 'MIDSUMMER_NIGHT_S_DREAM',
  MUCH_ADO_ABOUT_NOTHING = 'MUCH_ADO_ABOUT_NOTHING',
  PERICLES = 'PERICLES',
  TAMING_OF_THE_SHREW = 'TAMING_OF_THE_SHREW',
  TWELFTH_NIGHT = 'TWELFTH_NIGHT',
  TWO_GENTLEMEN_OF_VERONA = 'TWO_GENTLEMEN_OF_VERONA',
  WINTER_S_TALE = 'WINTER_S_TALE',
  
  // Histories
  HENRY_IV_PART_1 = 'HENRY_IV_PART_1',
  HENRY_IV_PART_2 = 'HENRY_IV_PART_2',
  HENRY_V = 'HENRY_V',
  HENRY_VI_PART_1 = 'HENRY_VI_PART_1',
  HENRY_VI_PART_2 = 'HENRY_VI_PART_2',
  HENRY_VI_PART_3 = 'HENRY_VI_PART_3',
  HENRY_VIII = 'HENRY_VIII',
  KING_JOHN = 'KING_JOHN',
  RICHARD_II = 'RICHARD_II',
  RICHARD_III = 'RICHARD_III',
  
  // Tragedies
  ANTONY_AND_CLEOPATRA = 'ANTONY_AND_CLEOPATRA',
  CORIOLANUS = 'CORIOLANUS',
  HAMLET = 'HAMLET',
  JULIUS_CAESAR = 'JULIUS_CAESAR',
  KING_LEAR = 'KING_LEAR',
  MACBETH = 'MACBETH',
  OTHELLO = 'OTHELLO',
  ROMEO_AND_JULIET = 'ROMEO_AND_JULIET',
  TIMON_OF_ATHENS = 'TIMON_OF_ATHENS',
  TITUS_ANDRONICUS = 'TITUS_ANDRONICUS',
  TROILUS_AND_CRESSIDA = 'TROILUS_AND_CRESSIDA',
  
  // Romances (The Tempest is the main addition here)
  TEMPEST = 'TEMPEST',
  
  // Other/Non-Shakespeare
  OTHER = 'OTHER',
}

export const PLAY_TITLES: Record<CanonicalPlay, string> = {
  // Comedies
  [CanonicalPlay.ALL_S_WELL_THAT_ENDS_WELL]: "All's Well That Ends Well",
  [CanonicalPlay.AS_YOU_LIKE_IT]: 'As You Like It',
  [CanonicalPlay.COMEDY_OF_ERRORS]: 'The Comedy of Errors',
  [CanonicalPlay.CYMBELINE]: 'Cymbeline',
  [CanonicalPlay.LOVE_S_LABOUR_S_LOST]: "Love's Labour's Lost",
  [CanonicalPlay.MEASURE_FOR_MEASURE]: 'Measure for Measure',
  [CanonicalPlay.MERCHANT_OF_VENICE]: 'The Merchant of Venice',
  [CanonicalPlay.MERRY_WIVES_OF_WINDSOR]: 'The Merry Wives of Windsor',
  [CanonicalPlay.MIDSUMMER_NIGHT_S_DREAM]: "A Midsummer Night's Dream",
  [CanonicalPlay.MUCH_ADO_ABOUT_NOTHING]: 'Much Ado About Nothing',
  [CanonicalPlay.PERICLES]: 'Pericles, Prince of Tyre',
  [CanonicalPlay.TAMING_OF_THE_SHREW]: 'The Taming of the Shrew',
  [CanonicalPlay.TWELFTH_NIGHT]: 'Twelfth Night',
  [CanonicalPlay.TWO_GENTLEMEN_OF_VERONA]: 'The Two Gentlemen of Verona',
  [CanonicalPlay.WINTER_S_TALE]: 'The Winter\'s Tale',
  
  // Histories
  [CanonicalPlay.HENRY_IV_PART_1]: 'Henry IV, Part 1',
  [CanonicalPlay.HENRY_IV_PART_2]: 'Henry IV, Part 2',
  [CanonicalPlay.HENRY_V]: 'Henry V',
  [CanonicalPlay.HENRY_VI_PART_1]: 'Henry VI, Part 1',
  [CanonicalPlay.HENRY_VI_PART_2]: 'Henry VI, Part 2',
  [CanonicalPlay.HENRY_VI_PART_3]: 'Henry VI, Part 3',
  [CanonicalPlay.HENRY_VIII]: 'Henry VIII',
  [CanonicalPlay.KING_JOHN]: 'King John',
  [CanonicalPlay.RICHARD_II]: 'Richard II',
  [CanonicalPlay.RICHARD_III]: 'Richard III',
  
  // Tragedies
  [CanonicalPlay.ANTONY_AND_CLEOPATRA]: 'Antony and Cleopatra',
  [CanonicalPlay.CORIOLANUS]: 'Coriolanus',
  [CanonicalPlay.HAMLET]: 'Hamlet',
  [CanonicalPlay.JULIUS_CAESAR]: 'Julius Caesar',
  [CanonicalPlay.KING_LEAR]: 'King Lear',
  [CanonicalPlay.MACBETH]: 'Macbeth',
  [CanonicalPlay.OTHELLO]: 'Othello',
  [CanonicalPlay.ROMEO_AND_JULIET]: 'Romeo and Juliet',
  [CanonicalPlay.TIMON_OF_ATHENS]: 'Timon of Athens',
  [CanonicalPlay.TITUS_ANDRONICUS]: 'Titus Andronicus',
  [CanonicalPlay.TROILUS_AND_CRESSIDA]: 'Troilus and Cressida',
  
  // Romances
  [CanonicalPlay.TEMPEST]: 'The Tempest',
  
  // Other
  [CanonicalPlay.OTHER]: 'Other',
}

export const PLAY_CATEGORIES: Record<CanonicalPlay, PlayCategory> = {
  // Comedies
  [CanonicalPlay.ALL_S_WELL_THAT_ENDS_WELL]: PlayCategory.COMEDY,
  [CanonicalPlay.AS_YOU_LIKE_IT]: PlayCategory.COMEDY,
  [CanonicalPlay.COMEDY_OF_ERRORS]: PlayCategory.COMEDY,
  [CanonicalPlay.CYMBELINE]: PlayCategory.ROMANCE,
  [CanonicalPlay.LOVE_S_LABOUR_S_LOST]: PlayCategory.COMEDY,
  [CanonicalPlay.MEASURE_FOR_MEASURE]: PlayCategory.COMEDY,
  [CanonicalPlay.MERCHANT_OF_VENICE]: PlayCategory.COMEDY,
  [CanonicalPlay.MERRY_WIVES_OF_WINDSOR]: PlayCategory.COMEDY,
  [CanonicalPlay.MIDSUMMER_NIGHT_S_DREAM]: PlayCategory.COMEDY,
  [CanonicalPlay.MUCH_ADO_ABOUT_NOTHING]: PlayCategory.COMEDY,
  [CanonicalPlay.PERICLES]: PlayCategory.ROMANCE,
  [CanonicalPlay.TAMING_OF_THE_SHREW]: PlayCategory.COMEDY,
  [CanonicalPlay.TWELFTH_NIGHT]: PlayCategory.COMEDY,
  [CanonicalPlay.TWO_GENTLEMEN_OF_VERONA]: PlayCategory.COMEDY,
  [CanonicalPlay.WINTER_S_TALE]: PlayCategory.ROMANCE,
  
  // Histories
  [CanonicalPlay.HENRY_IV_PART_1]: PlayCategory.HISTORY,
  [CanonicalPlay.HENRY_IV_PART_2]: PlayCategory.HISTORY,
  [CanonicalPlay.HENRY_V]: PlayCategory.HISTORY,
  [CanonicalPlay.HENRY_VI_PART_1]: PlayCategory.HISTORY,
  [CanonicalPlay.HENRY_VI_PART_2]: PlayCategory.HISTORY,
  [CanonicalPlay.HENRY_VI_PART_3]: PlayCategory.HISTORY,
  [CanonicalPlay.HENRY_VIII]: PlayCategory.HISTORY,
  [CanonicalPlay.KING_JOHN]: PlayCategory.HISTORY,
  [CanonicalPlay.RICHARD_II]: PlayCategory.HISTORY,
  [CanonicalPlay.RICHARD_III]: PlayCategory.HISTORY,
  
  // Tragedies
  [CanonicalPlay.ANTONY_AND_CLEOPATRA]: PlayCategory.TRAGEDY,
  [CanonicalPlay.CORIOLANUS]: PlayCategory.TRAGEDY,
  [CanonicalPlay.HAMLET]: PlayCategory.TRAGEDY,
  [CanonicalPlay.JULIUS_CAESAR]: PlayCategory.TRAGEDY,
  [CanonicalPlay.KING_LEAR]: PlayCategory.TRAGEDY,
  [CanonicalPlay.MACBETH]: PlayCategory.TRAGEDY,
  [CanonicalPlay.OTHELLO]: PlayCategory.TRAGEDY,
  [CanonicalPlay.ROMEO_AND_JULIET]: PlayCategory.TRAGEDY,
  [CanonicalPlay.TIMON_OF_ATHENS]: PlayCategory.TRAGEDY,
  [CanonicalPlay.TITUS_ANDRONICUS]: PlayCategory.TRAGEDY,
  [CanonicalPlay.TROILUS_AND_CRESSIDA]: PlayCategory.TRAGEDY,
  
  // Romances
  [CanonicalPlay.TEMPEST]: PlayCategory.ROMANCE,
  
  // Other
  [CanonicalPlay.OTHER]: PlayCategory.OTHER,
}

export const PLAY_OPTIONS = Object.entries(PLAY_TITLES).map(([value, label]) => ({
  value,
  label,
}))

export const CATEGORY_TITLES: Record<PlayCategory, string> = {
  [PlayCategory.COMEDY]: 'Comedies',
  [PlayCategory.HISTORY]: 'Histories', 
  [PlayCategory.TRAGEDY]: 'Tragedies',
  [PlayCategory.ROMANCE]: 'Romances',
  [PlayCategory.OTHER]: 'Other',
}

export function getPlaysByCategory(category: PlayCategory): CanonicalPlay[] {
  return Object.entries(PLAY_CATEGORIES)
    .filter(([, cat]) => cat === category)
    .map(([play]) => play as CanonicalPlay)
}

export function getAllPlaysByCategory(): Record<PlayCategory, CanonicalPlay[]> {
  return {
    [PlayCategory.COMEDY]: getPlaysByCategory(PlayCategory.COMEDY),
    [PlayCategory.HISTORY]: getPlaysByCategory(PlayCategory.HISTORY),
    [PlayCategory.TRAGEDY]: getPlaysByCategory(PlayCategory.TRAGEDY),
    [PlayCategory.ROMANCE]: getPlaysByCategory(PlayCategory.ROMANCE),
    [PlayCategory.OTHER]: getPlaysByCategory(PlayCategory.OTHER),
  }
}

export interface PlayAlias {
  pattern: string
  play: CanonicalPlay
  confidence: number
}

export const DEFAULT_ALIASES: PlayAlias[] = [
  {
    pattern: 'r\\s*[&+]\\s*j|romeo.*juliet',
    play: CanonicalPlay.ROMEO_AND_JULIET,
    confidence: 0.9,
  },
  {
    pattern: 'scottish\\s+play|the\\s+scottish\\s+play',
    play: CanonicalPlay.MACBETH,
    confidence: 0.95,
  },
  {
    pattern: '12th\\s+night|twelfth\\s+night',
    play: CanonicalPlay.TWELFTH_NIGHT,
    confidence: 0.9,
  },
  {
    pattern: 'midsummer|midsummer.*dream|mnd',
    play: CanonicalPlay.MIDSUMMER_NIGHT_S_DREAM,
    confidence: 0.85,
  },
  {
    pattern: 'much\\s+ado',
    play: CanonicalPlay.MUCH_ADO_ABOUT_NOTHING,
    confidence: 0.9,
  },
  {
    pattern: 'merchant.*venice|mov',
    play: CanonicalPlay.MERCHANT_OF_VENICE,
    confidence: 0.85,
  },
  {
    pattern: 'taming.*shrew',
    play: CanonicalPlay.TAMING_OF_THE_SHREW,
    confidence: 0.9,
  },
  {
    pattern: 'as\\s+you\\s+like\\s+it|ayli',
    play: CanonicalPlay.AS_YOU_LIKE_IT,
    confidence: 0.9,
  },
  {
    pattern: "all.*s\\s+well|awew",
    play: CanonicalPlay.ALL_S_WELL_THAT_ENDS_WELL,
    confidence: 0.85,
  },
  {
    pattern: 'winter.*s\\s+tale|wt',
    play: CanonicalPlay.WINTER_S_TALE,
    confidence: 0.85,
  },
  {
    pattern: 'henry\\s+iv[^0-9]*1|henry\\s+iv.*part\\s*1|1st\\s+henry\\s+iv|henry4.*part1',
    play: CanonicalPlay.HENRY_IV_PART_1,
    confidence: 0.9,
  },
  {
    pattern: 'henry\\s+iv[^0-9]*2|henry\\s+iv.*part\\s*2|2nd\\s+henry\\s+iv|henry4.*part2',
    play: CanonicalPlay.HENRY_IV_PART_2,
    confidence: 0.9,
  },
  {
    pattern: 'henry\\s+v(?!i)',
    play: CanonicalPlay.HENRY_V,
    confidence: 0.9,
  },
  {
    pattern: 'henry\\s+vi.*part\\s*1|henry\\s+vi[^0-9]*1|henry6.*part1',
    play: CanonicalPlay.HENRY_VI_PART_1,
    confidence: 0.85,
  },
  {
    pattern: 'henry\\s+vi.*part\\s*2|henry\\s+vi[^0-9]*2|henry6.*part2',
    play: CanonicalPlay.HENRY_VI_PART_2,
    confidence: 0.85,
  },
  {
    pattern: 'henry\\s+vi.*part\\s*3|henry\\s+vi[^0-9]*3|henry6.*part3',
    play: CanonicalPlay.HENRY_VI_PART_3,
    confidence: 0.85,
  },
  {
    pattern: 'henry\\s+viii|henry8',
    play: CanonicalPlay.HENRY_VIII,
    confidence: 0.9,
  },
  {
    pattern: 'king\\s+john',
    play: CanonicalPlay.KING_JOHN,
    confidence: 0.9,
  },
  {
    pattern: 'richard\\s+ii(?!i)',
    play: CanonicalPlay.RICHARD_II,
    confidence: 0.9,
  },
  {
    pattern: 'richard\\s+iii',
    play: CanonicalPlay.RICHARD_III,
    confidence: 0.9,
  },
  {
    pattern: 'coriolanus',
    play: CanonicalPlay.CORIOLANUS,
    confidence: 0.9,
  },
  {
    pattern: 'antony.*cleopatra|cleopatra',
    play: CanonicalPlay.ANTONY_AND_CLEOPATRA,
    confidence: 0.9,
  },
  {
    pattern: 'titus.*andronicus',
    play: CanonicalPlay.TITUS_ANDRONICUS,
    confidence: 0.9,
  },
  {
    pattern: 'julius\\s+caesar',
    play: CanonicalPlay.JULIUS_CAESAR,
    confidence: 0.9,
  },
  {
    pattern: 'timon\\s+of\\s+athens',
    play: CanonicalPlay.TIMON_OF_ATHENS,
    confidence: 0.85,
  },
  {
    pattern: 'troilus.*cressida',
    play: CanonicalPlay.TROILUS_AND_CRESSIDA,
    confidence: 0.85,
  },
  {
    pattern: 'pericles',
    play: CanonicalPlay.PERICLES,
    confidence: 0.85,
  },
  {
    pattern: 'cymbeline',
    play: CanonicalPlay.CYMBELINE,
    confidence: 0.85,
  },
  {
    pattern: 'measure\\s+for\\s+measure',
    play: CanonicalPlay.MEASURE_FOR_MEASURE,
    confidence: 0.9,
  },
  {
    pattern: 'love.?s?\\s+labou?r.?s?\\s+lost',
    play: CanonicalPlay.LOVE_S_LABOUR_S_LOST,
    confidence: 0.9,
  },
  {
    pattern: 'two\\s+gentlemen',
    play: CanonicalPlay.TWO_GENTLEMEN_OF_VERONA,
    confidence: 0.9,
  },
  {
    pattern: 'comedy\\s+of\\s+errors',
    play: CanonicalPlay.COMEDY_OF_ERRORS,
    confidence: 0.9,
  },
  {
    pattern: 'merry\\s+wives',
    play: CanonicalPlay.MERRY_WIVES_OF_WINDSOR,
    confidence: 0.9,
  },
  {
    pattern: 'twelfth\\s+night|12th\\s+night',
    play: CanonicalPlay.TWELFTH_NIGHT,
    confidence: 0.9,
  },
  {
    pattern: 'winter.?s?\\s+tale',
    play: CanonicalPlay.WINTER_S_TALE,
    confidence: 0.9,
  },
  {
    pattern: 'taming\\s+of\\s+the\\s+shrew',
    play: CanonicalPlay.TAMING_OF_THE_SHREW,
    confidence: 0.9,
  },
  {
    pattern: 'as\\s+you\\s+like\\s+it',
    play: CanonicalPlay.AS_YOU_LIKE_IT,
    confidence: 0.9,
  },
  {
    pattern: 'all.?s?\\s+well\\s+that\\s+ends\\s+well',
    play: CanonicalPlay.ALL_S_WELL_THAT_ENDS_WELL,
    confidence: 0.9,
  },
  {
    pattern: 'othello',
    play: CanonicalPlay.OTHELLO,
    confidence: 0.9,
  },
  {
    pattern: 'king\\s+lear',
    play: CanonicalPlay.KING_LEAR,
    confidence: 0.9,
  },
  {
    pattern: 'hamlet',
    play: CanonicalPlay.HAMLET,
    confidence: 0.9,
  },
  {
    pattern: 'macbeth',
    play: CanonicalPlay.MACBETH,
    confidence: 0.95,
  },
  {
    pattern: 'tempest',
    play: CanonicalPlay.TEMPEST,
    confidence: 0.9,
  },
]
