const CITIES_STORAGE = "storedCities";
const PANEL_POSITION = "positionPanel";
const NPC_RULES = "npcRules";
const FARM_RULES = "farmRules";
const JOBS_STORAGE = "storedJobs";
const SETTINGS_STORAGE = "storedSettings";
const BOT_POWER = "bot_enabled";
const BOT_NOTIFICATIONS = "bot_notifications";
const BOT_STATS = "bot_statistics";
const BOT_ON = "1";
const BOT_OFF = "0";

const BOT_IN_PROGRESS = "bot_progress";
const NPC_IN_PROGRESS = "npc_progress";

const POSITION_UP = "UP";
const POSITION_DOWN = "DOWN";
const TRIBE_ROMAN = "tribe1"; //
const TRIBE_TEUTON = "tribe2"; //
const TRIBE_GAUL = "tribe3"; //
const TRIBE_EGIPT = "tribe6"; //
const TRIBE_HUN = "tribe7"; //

const WALLS = {
  tribe1: 31,
  tribe2: 32,
  tribe3: 33,
  tribe6: 42,
  tribe7: 43,
};

const Q1 = "q1";
const Q2 = "q2";

const ON = localStorage.getItem(BOT_POWER) === BOT_ON;

const ON_N = localStorage.getItem(BOT_NOTIFICATIONS) === BOT_ON;
const ON_S = localStorage.getItem(BOT_STATS) === BOT_ON;
