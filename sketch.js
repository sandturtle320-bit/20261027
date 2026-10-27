let walkSpriteSheet; 
let standSpriteSheet; 
let jumpSpriteSheet; 
let characterX = 0; 
let characterY = 0; 
let groundY = 0; // 記錄地板高度
let velocityY = 0; // 角色的垂直速度
let gravity = 0.8; // 重力加速度
let jumpStrength = 0; // 跳躍力度

let facingDirection = 1; 
let currentFrame = 0; 
let lastFrameTime = 0; 
let previousAnimation = "stand"; 

// 修正為正確的影格數量
const WALK_FRAME_COUNT = 8; 
const STAND_FRAME_COUNT = 7; 
const JUMP_FRAME_COUNT = 10; 
const FRAME_INTERVAL = 100; 
const MOVE_SPEED = 4; 

function preload() { 
  // 已經將資料夾名稱改為 action
  // 注意：如果你的 action 資料夾裡面沒有再分 walk、stand、jump 子資料夾，
  // 請把中間的那段刪掉，改成例如 loadImage("action/ALL3.png");
  walkSpriteSheet = loadImage("action/walk/ALL3.png"); 
  standSpriteSheet = loadImage("action/stand/ALL1.png"); 
  jumpSpriteSheet = loadImage("action/jump/ALL2.png"); 
} 

function setup() { 
  createCanvas(windowWidth, windowHeight); 
  imageMode(CENTER); 
  
  // 設定初始位置與地板高度 (設在畫面偏下方)
  characterX = width / 2; 
  groundY = height / 2 + 100; 
  characterY = groundY; 
  frameRate(60); 

  // 根據畫面高度動態計算跳躍力度，目標為跳起 1/4 畫面高度
  let jumpHeight = height / 4;
  jumpStrength = -sqrt(2 * gravity * jumpHeight);
} 

function draw() { 
  background("#caf0f8"); 

  // --- 1. 處理左右移動 ---
  let horizontalInput = 0; 
  if (keyIsDown(RIGHT_ARROW)) { 
    horizontalInput = 1; 
    facingDirection = 1; 
  } 
  if (keyIsDown(LEFT_ARROW)) { 
    horizontalInput = -1; 
    facingDirection = -1; 
  } 
  characterX += horizontalInput * MOVE_SPEED; 

  // --- 2. 處理跳躍與重力 ---
  characterY += velocityY; // 更新垂直位置
  velocityY += gravity;    // 速度受重力影響遞增 (往下掉)

  // 如果角色碰到或低於地板，就停留在地板上
  if (characterY >= groundY) { 
    characterY = groundY; 
    velocityY = 0; 
  } 

  // --- 3. 判斷動畫狀態與縮放 ---
  // 只要 Y 座標還沒回到地板，就視為在跳躍狀態
  const isJumping = (characterY < groundY); 
  const animationState = isJumping ? "jump" : (horizontalInput === 0 ? "stand" : "walk"); 
  
  const activeSpriteSheet = animationState === "jump" ? jumpSpriteSheet : (animationState === "stand" ? standSpriteSheet : walkSpriteSheet); 
  const activeFrameCount = animationState === "jump" ? JUMP_FRAME_COUNT : (animationState === "stand" ? STAND_FRAME_COUNT : WALK_FRAME_COUNT); 
  
  const frameWidth = activeSpriteSheet.width / activeFrameCount; 
  const frameHeight = activeSpriteSheet.height; 
  const displayScale = min(1, (height * 0.55) / frameHeight); 
  const displayWidth = frameWidth * displayScale; 
  
  // 限制角色水平範圍不能超出畫面
  characterX = constrain(characterX, displayWidth / 2, width - displayWidth / 2); 

  // --- 4. 更新動畫影格 ---
  if (animationState !== previousAnimation) { 
    currentFrame = 0; 
    lastFrameTime = millis(); 
    previousAnimation = animationState; 
  } 
  if (millis() - lastFrameTime >= FRAME_INTERVAL) { 
    currentFrame = (currentFrame + 1) % activeFrameCount; 
    lastFrameTime = millis(); 
  } 

  // --- 5. 繪製角色 ---
  push(); 
  translate(characterX, characterY); 
  scale(facingDirection * displayScale, displayScale); 
  image(activeSpriteSheet, 0, 0, frameWidth, frameHeight, currentFrame * frameWidth, 0, frameWidth, frameHeight); 
  pop(); 
} 

function keyPressed() { 
  if (keyCode === 32) { 
    // 只有在接觸地面時才可以按空白鍵跳躍，避免在空中二段跳
    if (characterY >= groundY) {
      velocityY = jumpStrength; 
    }
    return false; // 阻止空白鍵捲動網頁 
  } 
} 

function windowResized() { 
  resizeCanvas(windowWidth, windowHeight); 
  groundY = height / 2 + 100; 
  
  // 視窗改變時重新計算 1/4 高度的跳躍力度
  let jumpHeight = height / 4;
  jumpStrength = -sqrt(2 * gravity * jumpHeight);
  
  // 防止視窗縮小導致角色掉到畫面外
  if (characterY > groundY) {
    characterY = groundY;
  }
}