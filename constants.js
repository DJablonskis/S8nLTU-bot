const VER = "0.10.8";
const APP_NAME = "S8nLTU BOT";

const CITIES_STORAGE = "storedCities";
const PANEL_POSITION = "positionPanel";
const NPC_RULES = "npcRules";
const FARM_RULES = "farmRules";

const JOBS_STORAGE = "jobsManager";
const JOBS_SETTINGS_STORAGE = "jobsManagerSettings";
const CM_STORAGE = "constructionManager";
const PROD_STORAGE = "productionManager";
const SETTINGS_STORAGE = "storedSettings";
const BOT_POWER = "bot_enabled";
const BOT_NOTIFICATIONS = "bot_notifications";
const BOT_STATS = "bot_statistics";
const BOT_ON = "1";
const BOT_OFF = "0";

const CAPITAL = "capital";

const BOT_IN_PROGRESS = "bot_progress";
const NPC_IN_PROGRESS = "npc_progress";

const POSITION_UP = "UP";
const POSITION_DOWN = "DOWN";

const TRIBE = "tribe";
const TRIBE_ROMAN = "1"; //
const TRIBE_TEUTON = "2"; //
const TRIBE_GAUL = "3"; //
const TRIBE_EGIPT = "6"; //
const TRIBE_HUN = "7"; //

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

const titleStyle =
  'letter-spacing: .1em; font-family: "Noto Serif"; font-weight: bold; color: #5e463a; margin-bottom: 5px; margin-top: 5px;';
