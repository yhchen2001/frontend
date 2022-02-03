const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.fillStyle = '#000';
context.fillRect(0, 0, canvas.width, canvas.height);
context.scale(20, 20);

const arena = creatMatrix(12, 20);
console.log(arena);
console.table(arena);

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

function creatMatrix(w, h){
    const matrix = [];
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ]
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

const colors = [
    null, 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'
]

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for(let y = 0; y < m.length; ++y){
        for(let x = 0; x < m[y].length; ++x){
            if( m[y][x] !== 0 &&
               (arena[y + o.y] && // (arr[y] && arr[y][x]) !== 0, 為了先確認arr[y]存在
                arena[y + o.y][x + o.x]) !== 0) {
                console.log("collide");
                return true;
            }
        }
    }
    return false;
}

function clearCanvas(){
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if(val !== 0){
                context.fillStyle = colors[val];
                context.fillRect(x+offset.x, y+offset.y, 1, 1)
            }
        });
    });
}

const player = {
    pos: {x:5, y:5},
    matrix: null,
    score:0
}

function playerReset(){
    const p = 'ILJOTSZ';
    player.matrix = createPiece(p[p.length * Math.random() | 0 ])
    //player.matrix = createPiece("I");
    player.pos.y = 0;
    player.pos.x = (arena[0].length/2 | 0) -
                    (player.matrix[0].length/2 | 0);
    if(collide(arena, player)){
        arena.forEach((row) => {
            row.fill(0);
            player.score = 0;
            updateScore();
        });
    }
}

// this is used to update the playground
function draw(){
    clearCanvas();
    drawMatrix(arena, {x:0, y:0})
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player){
    player.matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if(val !== 0){
                arena[y + player.pos.y][x + player.pos.x] = val;
            }
        });
    });
}

function arenaSweep(){
    let rowCount = 1;
    outer: for(let y = arena.length - 1; y > 0; y--){
        for(let x = 0; x < arena[y].length; x++){
            if(arena[y][x] === 0)
                continue outer;
        }
        arena.splice(y, 1);
        row = new Array(arena[0].length).fill(0);
        arena.unshift(row);
        y++;
        console.log("sweep")
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

let dropCounter = 0;
let dropInterval = 1000; // millisecond
let lastTime = 0;

function update(time=0){
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        playerDrop();
    }
    //console.log(deltaTime);
    draw();
    requestAnimationFrame(update);
}

function rotate(m, dir) {
    for(let y = 0; y < m.length; y++){
        for(let x = 0; x < y; x++){
            [ m[x][y], m[y][x] ] = [ m[y][x], m[x][y] ];
        }
    }

    if(dir > 0){
        m.forEach(row => row.reverse());
    }else{
        m.reverse();
    }
}
function playerRotate(dir){
    const posX = player.pos.x;
    rotate(player.matrix, dir);
    let offset = 1;
    while(collide(arena, player)){
        player.pos.x += offset;
        offset = -offset + (offset > 0 ? -1:1);
        // it rotates too much that it doesn't make sense
        if(offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            player.pos.x = posX;
            return;
        }
    }
}

function playerDrop(){
    player.pos.y ++;
    dropCounter = 0;
    if( collide(arena, player) ){
        player.pos.y --;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        //player.pos.y = 0;
    }
}

function playerMove(dir){
    player.pos.x += dir;
    if(collide(arena, player)){
        player.pos.x -= dir;
    }
}

function playerDropImmediate(){
    while(collide(arena, player) != true){
        player.pos.y += 1;
    }
    player.pos.y --;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
}

document.addEventListener('keydown', event => {
    console.log(event)
    if(event.code === 'ArrowLeft'){
        playerMove(-1);
    }else if(event.code === 'ArrowRight'){
        playerMove(1);
    }else if(event.code === 'ArrowDown'){
        playerDrop();
    }else if(event.code === 'KeyQ'){
        playerRotate(-1)
    }else if(event.code === 'KeyW'){
        playerRotate(1)
    }else if(event.code === 'Space'){
        playerDropImmediate();
    }
})

playerReset();
updateScore();
update();