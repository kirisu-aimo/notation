

const test1 = document.getElementById("test1")
const test2 = document.getElementById("test2")






//項の管理
let ntnElements = [];
let onMouse = [];





const sortStr = (str) => {
    let array = str.match(/\d/g);
    if(!array || array.length === 0) {return str;}
    return array.sort().join('');
}








//配列を軌道分析表記法に変換
const concatElements = index => {
    let e = ntnElements[index];
    return (e.rdSide +
    e.ulSide.replace('6','0') +
        '(' +
        e.dsSide +
        '-' +
        e.pmSide +
        ').' +
        e.contact +
        e.rotDir +
        '.' +
        e.startPenDir +
        e.endPenDir
    ).replace('(-)','')
};



//軌道分析表記法を配列に変換
const splitElements = (element,index) => {
    let e = ntnElements[index];
    let n = element.replace(/^([^\.)]*)\./,'$1(-).');
    let regExp = /^([0-6]{0,2})\(([1-5]*?)-([1-5]*?)\)\.([qhva]?)([-+]?)\.([EWSNXYZKL]?)([EWSNXYZKL]*)/
    let str = n.match(regExp);
    if (regExp.test(n)){
        ntnElements.splice(index,1,{
            rdSide: str[1].charAt(0),
            ulSide: str[1].charAt(1).replace('0','6'),
            dsSide: sortStr(str[2]),
            pmSide: sortStr(str[3]),
            contact: str[4],
            rotDir: str[5],
            startPenDir: str[6].charAt(0),
            endPenDir: str[7].charAt(str[7].length-1),
        })
    } else {
        console.log('第' + (index + 1) +'項の入力表記が適切ではありません');
        ntnElements.splice(index,1,{
            rdSide: "",
            ulSide: "",
            dsSide: "",
            pmSide: "",
            contact: "",
            rotDir: "",
            startPenDir: "",
            endPenDir: "",
        })
    }

    onMouse.splice(index,1,{
        rdSide: false,
        ulSide: false,
        dsSide: "",
        pmSide: "",
        contact: false,
        rotDir: false,
        startPenDir: false,
        endPenDir: false,
    })
    //console.log(index)
    //console.log(onMouse[index]);
}




//配列例


splitElements('45.q-.SW',0)
splitElements('35(-4).q-.WW',1)
splitElements('03.q-.EW',2)
splitElements('34.q-.EW',3)
splitElements('34.q+.EW',4)
splitElements('45.q+.EN',5)
splitElements('25(3-4).q-.EN',6)

/*
splitElements('45.q-.SW',0)
splitElements('35(-4).q-.WW',1)
splitElements('03.q-.EW',2)
splitElements('34.q-.EW',3)
splitElements('34.q+.EW',4)
splitElements('45.q+.EN',5)
splitElements('25(3-4).q-.EN',6)

splitElements('34.q-.SW',0)
splitElements('02.q-.EW',1)
splitElements('24(3-).q-.EW',2)
splitElements('23.q-.WW',3)
*/


/*
splitElements('45.q-.SW',0)
splitElements('35(-4).q-.WE',1)
splitElements('25(3-4).q-.EW',2)
splitElements('34.q-.ES',3)
*/
/*
splitElements('34.q+.SW',0)
splitElements('34.q+.WS',1)
splitElements('34.q-.SW',2)
splitElements('34.q-.SW',3)
*/





const resetnotationElements = () => {
    let elements = document.querySelectorAll('#sectionList input');
    elements.forEach ((element, index) => {
        splitElements(element.value,index);
    });
}





const addSectionButton = document.getElementById('addSection');
addSectionButton.addEventListener("click", () => {
    ntnElements.push({
        rdSide: "",
        ulSide: "",
        dsSide: "",
        pmSide: "",
        contact: "q",
        rotDir: "-",
        startPenDir: "",
        endPenDir: "",
    });
    redisplaySections();
    resetnotationElements();
    redisplayCanvas();
})


const redisplaySections = () => {
    let sectionList = document.getElementById('sectionList')
    sectionList.innerHTML = ""
    
    for (let index = 0; index < ntnElements.length; index++) {
        let listItem = document.createElement("div");
        
        let sectionInput = document.createElement("input");
        sectionInput.placeholder = "表記を入力";
        sectionInput.value = concatElements(index); //あとでforEachに変える
        sectionInput.oninput = () => {
            resetnotationElements();
            redisplayCanvas();
        }
        
        let upButton = document.createElement("button");
        upButton.textContent = "▲";
        upButton.onclick = () => {
            moveSectionUp(index);
            redisplayCanvas();
        }
        
        let downButton = document.createElement("button");
        downButton.textContent = "▼";
        downButton.onclick = () => {
            moveSectionDown(index);
            redisplayCanvas();
        }
        
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "×";
        deleteButton.onclick = () => {
            deleteSection(index);
            resetnotationElements();
            redisplayCanvas();
        }
        
        listItem.appendChild(document.createTextNode('第' + (index + 1) + '項 '));
        listItem.appendChild(sectionInput);
        listItem.appendChild(upButton);
        listItem.appendChild(downButton);
        listItem.appendChild(deleteButton);
        sectionList.appendChild(listItem);

    }
    //ntnElements.forEach((index) => { });
}



const moveSectionUp = (index) => {
    if (index > 0) {
        let temp = ntnElements[index];
        ntnElements[index] = ntnElements[index - 1];
        ntnElements[index - 1] = temp;
        redisplaySections();
    }
}


const moveSectionDown = (index) => {
    if (index < ntnElements.length - 1) {
        let temp = ntnElements[index];
        ntnElements[index] = ntnElements[index + 1];
        ntnElements[index + 1] = temp;
        redisplaySections();
    }
}

const deleteSection = (index) => {
    ntnElements.splice(index,1);
    onMouse.splice(index,1);
    redisplaySections();
}


redisplaySections();





let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");





let isRightHandMode = true;
let isdoubleArcMode = false;
let isLeanMode = false; //実装予定
let isConnectionMode = false; //実装予定







//位置関係,座標の設定
const lineNum = 7;
const standardLength = canvas.width;
const marginX = standardLength/5;
const marginY = marginX;
const baseLineWidthX = (canvas.width - marginX * 2) / (lineNum - 1);
const baseLineWidthY = baseLineWidthX;
const arcRadius = baseLineWidthY / 2.5;
const pointRadius = baseLineWidthY / 10;





//ブールから符号への変換
const sign = (boolean) => {
    if (boolean == null || boolean == true) {
        return 1;
    } else{
        return -1;
    }
};


const rightAngles = (num) => {
    return Math.PI / 2 * num;
};





//軸番号を座標に変換(ハンドモード変更対応)
const numtoX = num => {
    let pos = marginX + baseLineWidthX * parseInt(num)
    if (isRightHandMode) {
        return canvas.width - pos;
    } else {
        return pos;
    }
};

//項リストのインデックスを座標に変換
const indextoY = index => {
    return marginY + baseLineWidthY * index;
};






//軸番号とインデックスと方位を座標に変換(ハンドモード変更対応)
const toShiftedX = (num,dir,isPalmSide) => {
    let shift;
    switch (dir) {
        case 'E' : shift = 1; break;
        case 'S' : shift = 0; break;
        case 'W' : shift = -1; break;
        case 'N' : shift = 0; break;
    }
    return numtoX(num) + shift * sign(isPalmSide) * sign(isRightHandMode) * arcRadius;
};

const toShiftedY = (index,dir,isPalmSide) => {
    let shift;
    switch (dir) {
        case 'E' : shift = 0; break;
        case 'S' : shift = 1; break;
        case 'W' : shift = 0; break;
        case 'N' : shift = -1; break;
    }
    return indextoY(index) + shift * sign(isPalmSide) * arcRadius;
};




//方位をラジアンに変換(ハンドモード変更対応)
const penDirtoRad = (dir) => {
    let rad;
    switch (dir) {
        case 'N' : rad = 0; break;
        case 'W' : rad = 1; break;
        case 'S' : rad = 2; break;
        case 'E' : rad = 3; break;
    }
    return rightAngles(1) * rad * sign(isRightHandMode)
};

//始方位と終方位と回転方向を中心角(ラジアン)に変換(ハンドモード対応)
const toCentralRad = (startAngle,endAngle,rotDir) => {
    let difference = endAngle - startAngle
    if ((rotDir == '+') == isRightHandMode) {
        return (difference + rightAngles(3)) % rightAngles(4) + rightAngles(1);
    } else if ((rotDir == '-') == isRightHandMode) {
        return - (( - difference + rightAngles(3)) % rightAngles(4)) - rightAngles(1)
    } else {
        return 0
    }
    
    /*
    上の式の説明
    
    endAngle - startAngle は (-3から3までの整数) * (Math.PI / 2) になる
    
    単純化すると
    
    正回転の時
    f(3)  = (3 + 3) % 4 + 1  = 3
    f(2)  = (2 + 3) % 4 + 1  = 2
    f(1)  = (1 + 3) % 4 + 1  = 1
    f(0)  = (0 + 3) % 4 + 1  = 4
    f(-1) = (-1 + 3) % 4 + 1 = 3
    f(-2) = (-2 + 3) % 4 + 1 = 2
    f(-3) = (-3 + 3) % 4 + 1 = 1
    
    負回転の時
    f(3)  = -((-3 + 3) % 4) - 1 = -1
    f(2)  = -((-2 + 3) % 4) - 1 = -2
    f(1)  = -((-1 + 3) % 4) - 1 = -3
    f(0)  = -((-0 + 3) % 4) - 1 = -4
    f(-1) = -((+1 + 3) % 4) - 1 = -1
    f(-2) = -((+2 + 3) % 4) - 1 = -2
    f(-3) = -((+3 + 3) % 4) - 1 = -3
    
    */
}









//色の設定
const colorDB = {
    w:"#FFFFFF",
    ltGy:"#EEEEEE",
    mGy:"#808080",
    dkGy:"#222222",
    bk:"#000000",

    ltB:"rgba(127, 127, 255, 1.0)",
    dkR:"#993D3D",
    dkB:"#3D3D99",

};



//直線の描画関数
const drawLine = (fromX, fromY, toX, toY, color) => {
    context.beginPath();
    context.strokeStyle = color ? color : colorDB.bk;
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
};

//点の描画
const drawPoint = (x,y,size,strokeColor,fillColor) => {
    context.beginPath();
    context.strokeStyle = strokeColor;
    context.fillStyle = fillColor;
    context.arc(
        x,
        y,
        pointRadius * size,
        0,
        Math.PI * 2,
        0,
    );    
    context.fill();
    context.stroke();
}

//円弧の描画
const drawArc = (x,y,radius,startAngle,centralAngle,color) => {
    context.beginPath();
    context.strokeStyle = color;
    context.arc(
        x,
        y,
        radius,
        -startAngle - Math.PI / 2,
        -startAngle - Math.PI / 2 - centralAngle,
        centralAngle > 0
    );    
    context.stroke();
}

//三角形の描画(現在未使用)
const drawTriangle = (x,y,base) => {

}








let mouseNum;
let mouseIndex;




const distance = (fromX,fromY,toX,toY) => {
    return Math.pow((toX - fromX),2) + Math.pow((toY - fromY),2)
};
const removeDuplicateNum = (element) => {
    element.pmSide = element.pmSide.replace(element.rdSide,'');
    element.pmSide = element.pmSide.replace(element.ulSide,'');
    element.dsSide = element.dsSide.replace(element.rdSide,'');
    element.dsSide = element.dsSide.replace(element.ulSide,'');
}



let isMouseDown = false;
canvas.addEventListener("mousedown", (event) => {
    isMouseDown = true;
});
canvas.addEventListener("mouseup", (event) => {
    isMouseDown = false;
});


let isKeyDown = false;
window.addEventListener("keydown", (event) => {
    if ((event.key === 'a' || event.key === 'A') && isKeyDown == false) {
        isKeyDown = true;
        onMouse.forEach((element) => {
            element.rdSide = false
            element.rdSide = false,
            element.ulSide = false,
            element.dsSide = "",
            element.pmSide = "",
            element.contact = false,
            element.rotDir = false,
            element.startPenDir = false,
            element.endPenDir = false
        })
        redisplaySections();
        redisplayCanvas();
    }
});
window.addEventListener("keyup", (event) => {
    if ((event.key === 'a' || event.key === 'A') && isKeyDown == true) {
        isKeyDown = false;
        onMouse.forEach((element) => {
            element.rdSide = false
            element.rdSide = false,
            element.ulSide = false,
            element.dsSide = "",
            element.pmSide = "",
            element.contact = false,
            element.rotDir = false,
            element.startPenDir = false,
            element.endPenDir = false
        })
        redisplaySections();
        redisplayCanvas();
    }
});


const getNearestNum = (x) => {
    let outofRangeX = marginX - baseLineWidthX / 2;
    
    let tempNum = Math.floor((x - outofRangeX) / baseLineWidthY)
    return (isRightHandMode ? lineNum - 1 - tempNum : tempNum).toString();
    
    /*
    let iswithinRange =  x > outofRangeX  && x < canvas.width - outofRangeX
    if (iswithinRange) {
        let temp =  Math.floor((x - outofRangeX) / baseLineWidthX)
        return (isRightHandMode ? lineNum - 1 - temp : temp).toString();
    } else {return 'outofRange'}
    */
};
const getNearestIndex =  (y) => {
    let outofRangeY = marginY - baseLineWidthY / 2;
    
    return  (Math.floor((y - outofRangeY) / baseLineWidthY)).toString();
    
    /*
    let iswithinRange =  y > outofRangeY  && y < canvas.width - outofRangeY
    if (iswithinRange) {
        return  (Math.floor((y - outofRangeY) / baseLineWidthY)).toString();
    } else {return 'outofRange'}
    */
};




canvas.addEventListener("mousemove", (event) => {
    event.preventDefault()
    const {offsetX, offsetY} = event;
    
    mouseNum = getNearestNum(offsetX);
    mouseIndex = getNearestIndex(offsetY);

    const isOnMouseIndex = (index) => {
        return mouseIndex == index;
    };
    const isSelectedPenDir = (element,index,offsetX,offsetY) => {
        let isOnMouseNum =  ntnElements[index].ulSide == getNearestNum(offsetX);
        let isOnMouseIndex = index == getNearestIndex(offsetY);
        let isOnMouse = isOnMouseNum && isOnMouseIndex
    
        let num = ntnElements[index].ulSide;
        let isPalmSide = true;
        let startX = toShiftedX(num,ntnElements[index].startPenDir,isPalmSide);
        let startY = toShiftedY(index,ntnElements[index].startPenDir,isPalmSide);
        let endX = toShiftedX(num,ntnElements[index].endPenDir,isPalmSide);
        let endY = toShiftedY(index,ntnElements[index].endPenDir,isPalmSide);
        let centralX = numtoX(num);
        let centralY = indextoY(index);
        
        let distancetoStartPoint;
        let distancetoEndPoint;
        
        if (distance(startX,startY,endX,endY) > 0) {
            distancetoStartPoint = distance(offsetX,offsetY,startX,startY);
            distancetoEndPoint = distance(offsetX,offsetY,endX,endY);
        } else if (distance(startX,startY,endX,endY) == 0) {
            rotAngle = sign(ntnElements[index].rotDir == '-') * sign(isRightHandMode) * rightAngles(1)
            let rotatedX;
            let rotatedY;
            const rotation = (rotAngle) => {
                rotatedX = centralX + (startX - centralX) * Math.cos(rotAngle) - (startY - centralY) * Math.sin(rotAngle);
                rotatedY = centralY + (startX - centralX) * Math.sin(rotAngle) + (startY - centralY) * Math.cos(rotAngle);
                return distance(offsetX,offsetY,rotatedX,rotatedY);
            }
            distancetoStartPoint = rotation(rotAngle);
            distancetoEndPoint = rotation(-rotAngle);
        }
        element.startPenDir = isOnMouse && (distancetoStartPoint <= distancetoEndPoint);
        element.endPenDir = isOnMouse && (distancetoStartPoint > distancetoEndPoint);
    };

    const moveHoldingPointWithDrag = (element,index,mouseNum) => {
        const isOverRdSide = (num) => {return parseInt(num) < 0};
        const isOverUlSide = (num) => {return parseInt(num) > 6};
        //const isOverUpSide = (index) => {return index < 0};
        //const isOverDownSide = (index) => {return index > 12};
        if (onMouse[index].rdSide) {
            let limitRdSide = (num) => {return Math.max(num, Math.max(parseInt(element.ulSide),5) - 5)};
            let limitUlSide = (num) => {return Math.min(num, parseInt(element.ulSide) - 1)};
            let num = (isOverRdSide(mouseNum)) ? 0 : mouseNum;
            element.rdSide = limitRdSide(limitUlSide(num)).toString();
            removeDuplicateNum(element);
        }
        if (onMouse[index].ulSide) {
            let limitRdSide = (num) => {return Math.max(num, parseInt(element.rdSide) + 1)};
            let limitUlSide = (num) => {return Math.min(num, Math.min(parseInt(element.rdSide),1) + 5)};
            let num = (isOverUlSide(mouseNum)) ? 6 : mouseNum;
            element.ulSide = limitRdSide(limitUlSide(num)).toString();
            removeDuplicateNum(element);
        }
    };
    const moveRotPointWithDrag = (element,index,offsetX,offsetY) => {
        let centralX = numtoX(element.ulSide);
        let centralY = indextoY(index);
        let distancetoRight = distance(offsetX,offsetY,centralX + arcRadius,centralY);
        let distancetoLeft = distance(offsetX,offsetY,centralX - arcRadius,centralY);
        let distancetoE = isRightHandMode ? distancetoRight : distancetoLeft;
        let distancetoW = isRightHandMode ? distancetoLeft : distancetoRight;
        let distancetoS = distance(offsetX,offsetY,centralX,centralY + arcRadius);
        let distancetoN = distance(offsetX,offsetY,centralX,centralY - arcRadius);
        let minDistance = Math.min(distancetoE,distancetoW,distancetoS,distancetoN)
        if (onMouse[index].startPenDir) {
            switch (minDistance) {
                case distancetoE : element.startPenDir = 'E'; break;
                case distancetoW : element.startPenDir = 'W'; break;
                case distancetoS : element.startPenDir = 'S'; break;
                case distancetoN : element.startPenDir = 'N'; break;
            }
        }
        if (onMouse[index].endPenDir) {
            switch (minDistance) {
                case distancetoE : element.endPenDir = 'E'; break;
                case distancetoW : element.endPenDir = 'W'; break;
                case distancetoS : element.endPenDir = 'S'; break;
                case distancetoN : element.endPenDir = 'N'; break;
            }
        }
    }

    if (isMouseDown) {
        ntnElements.forEach((element,index) => {
            moveHoldingPointWithDrag(element,index,mouseNum);
            moveRotPointWithDrag(element,index,offsetX,offsetY);
        });
        redisplaySections();
        redisplayCanvas();
    } else if (!isKeyDown) {
        onMouse.forEach((element,index) => {
            element.rdSide = isOnMouseIndex(index) && (mouseNum == ntnElements[index].rdSide);
            element.ulSide = isOnMouseIndex(index) && (mouseNum == ntnElements[index].ulSide);
            
        })
        redisplayCanvas();
    } else {
        onMouse.forEach((element,index) => {
            element.rotDir = isOnMouseIndex(index) && (mouseNum == ntnElements[index].rdSide);
            isSelectedPenDir(element,index,offsetX,offsetY);
        })
        redisplayCanvas();
    }
});
canvas.addEventListener("click", (event) => {
    event.preventDefault()
    const switchBetweenPointWithClick = () => {
        if (!isKeyDown && (ntnElements.length >= mouseIndex)) {
            const element = ntnElements[mouseIndex]
            let isNotOverRdSide = parseInt(element.rdSide) < parseInt(mouseNum);
            let isNotOverulSide = parseInt(element.ulSide) > parseInt(mouseNum);
            if (isNotOverRdSide && isNotOverulSide) {
                if (element.dsSide.includes(mouseNum)) {
                    element.dsSide = element.dsSide.replace(mouseNum,'');
                    element.pmSide = sortStr(element.pmSide.concat(mouseNum));
                } else if (element.pmSide.includes(mouseNum)) {
                    element.pmSide = element.pmSide.replace(mouseNum,'');
                    element.dsSide = sortStr(element.dsSide.concat(mouseNum));
                } else if (!element.dsSide.includes(mouseNum) && !element.pmSide.includes(mouseNum)) {
                    element.pmSide = sortStr(element.pmSide.concat(mouseNum));
                }
                redisplaySections();
                redisplayCanvas();
            }
        }
    };
    switchBetweenPointWithClick();
    const switchRotDirWithClick = () => {
        if (isKeyDown) {
            ntnElements.forEach((element,index) => {
                if (onMouse[index].rotDir) {
                    element.rotDir = (element.rotDir == '-') ? '+' : '-';
                }
                redisplaySections();
                redisplayCanvas();
            })
        }
    };
    switchRotDirWithClick();
});







const clearCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = colorDB.w;
    context.fillRect(0, 0, canvas.width, canvas.height);
};    

const displayBaseLine = () => {
    //横
    for (var i = 0; i < 13; i++){
        drawLine(
            marginX,
            indextoY(i),
            canvas.width - marginX,
            indextoY(i),
            colorDB.ltGy
        );
    }
    //縦
    for (var i = 0; i < 7; i++){
        drawLine(
            numtoX(i),
            0,
            numtoX(i),
            canvas.height,
            colorDB.mGy
        );
    }    
}    

//挟指
const displayHoldLine = (element, index) => {
    let fromX = numtoX(element.rdSide);
    let fromY = indextoY(index);
    let toX = numtoX(element.ulSide);
    let toY = fromY;
    let strokeColor;
    
    let regExp = /[06]/
    strokeColor = regExp.test(element.rdSide + element.ulSide) ? colorDB.mGy : colorDB.bk
    drawLine(fromX,fromY,toX,toY,strokeColor);    
};    

//挟指
const displayHoldPoints = (element, index) => {
    let x;
    let y = indextoY(index);
    let size = 1;
    let strokeColor;
    let fillColor;
    
    let regExp = /[06]/
    
    x = numtoX(element.rdSide);
    strokeColor = onMouse[index].rdSide ? colorDB.ltB : colorDB.bk;
    fillColor = regExp.test(element.rdSide) ? colorDB.w : strokeColor;
    drawPoint(x,y,size,strokeColor,fillColor);
    
    x = numtoX(element.ulSide);
    strokeColor = onMouse[index].ulSide ? colorDB.ltB : colorDB.bk;
    fillColor = regExp.test(element.ulSide) ? colorDB.w : strokeColor;
    drawPoint(x,y,size,strokeColor,fillColor);
};

//内余指
const displayBetweenPoints = (element, index) => {
    
    const displayPoint = (num,isUpSide,strokeColor) => {
        let size = 1.5;
        let x = numtoX(num);
        let y = indextoY(index) - (baseLineWidthY * size / 10) * sign(isUpSide);
        let fillColor = colorDB.w;
        drawPoint(x,y,size,strokeColor,fillColor);
    }
    
    let strArray;
    
    strArray = element.dsSide.split("");
    strArray.forEach((element2) => {
        strokeColor = (!isKeyDown && (element2 == mouseNum) && (index == mouseIndex)) ? colorDB.ltB : colorDB.bk;
        displayPoint(element2,true,strokeColor)
    })
    
    strArray = element.pmSide.split("");
    strArray.forEach((element2) => {
        strokeColor = (!isKeyDown && (element2 == mouseNum) && (index == mouseIndex)) ? colorDB.ltB : colorDB.bk;
        displayPoint(element2,false,strokeColor)
    })
    
    const displayBetweenPointsLacking = () => {
        let isNotOverRdSide = parseInt(element.rdSide) < parseInt(mouseNum);
        let isNotOverulSide = parseInt(element.ulSide) > parseInt(mouseNum);
        let isNotOver = isNotOverRdSide && isNotOverulSide;
        let isNotInclude = !element.dsSide.includes(mouseNum) && !element.pmSide.includes(mouseNum);
        let isNotAir = (element.rdSide != 0) && (element.ulSide != 6);
        let isOnMouse = index == mouseIndex;
        if (!isKeyDown && isNotOver && isNotInclude && isNotAir && isOnMouse) {
            let x = numtoX(mouseNum);
            let y = indextoY(index);
            let size = 1;
            let strokeColor = colorDB.ltB;
            let fillColor = colorDB.w;
            drawPoint(x,y,size,strokeColor,fillColor)
        }
    };
    displayBetweenPointsLacking();

};

//回転
const displayRot = (element, index) => {
    let size = 0.5
    let radius = arcRadius;
    
    let num = element.ulSide;
    let startAngle = penDirtoRad(element.startPenDir);
    let endAngle = penDirtoRad(element.endPenDir);
    let strokeColor = colorDB.bk;
    let fillColor;
    let isPalmSide = true;
    
    
    const displayRotArc = () => {
        let x = numtoX(num);
        let y = indextoY(index);
        let centralAngle = toCentralRad(startAngle,endAngle,element.rotDir);
        strokeColor = onMouse[index].rotDir ? colorDB.ltB : colorDB.bk;
        drawArc(x,y,radius,startAngle,centralAngle,strokeColor);

    }

    const displayRotPoint = () => {
        let x1 = toShiftedX(num,element.startPenDir,isPalmSide);
        let y1 = toShiftedY(index,element.startPenDir,isPalmSide);
        strokeColor = onMouse[index].startPenDir ? colorDB.ltB : colorDB.bk;
        fillColor = strokeColor;
        if ((element.startPenDir !== element.endPenDir) || onMouse[index].startPenDir) {drawPoint(x1,y1,size,strokeColor,fillColor)};
    }
    
    const displayRotArrow = () => {
        let fromX = toShiftedX(num,element.endPenDir,isPalmSide);
        let fromY = toShiftedY(index,element.endPenDir,isPalmSide);
        
        let base = arcRadius / 5;
        let height = arcRadius / 3 * ((element.rotDir == '+') ? 1 : -1) * sign(isPalmSide);
        
        
        let heightX = 0;
        let heightY = 0;
        let baseX = 0;
        let baseY = 0;
        strokeColor = onMouse[index].endPenDir ? colorDB.ltB : colorDB.bk;
        fillColor = colorDB.w;
        
        switch (element.endPenDir) {
            case 'E':
                baseX = base;
                heightY = height;
                break;
            case 'W':
                baseX = base;
                heightY = - height;
                break;
            case 'S':
                heightX = - height;
                baseY = base;
                break;
            case 'N':
                heightX = height;
                baseY = base;
                break;
        }

        context.beginPath();
        context.strokeStyle = strokeColor;
        context.fillStyle = fillColor;
        context.moveTo(fromX,fromY);
        context.lineTo(fromX + heightX + baseX,fromY + heightY + baseY);
        context.lineTo(fromX + heightX - baseX,fromY + heightY - baseY);
        context.lineTo(fromX,fromY);
        context.fill();
        context.stroke();
    }

    

    displayRotArc();
    displayRotPoint();
    displayRotArrow();
    
    if (isdoubleArcMode) {
        num = element.rdSide;
        startAngle = penDirtoRad(element.startPenDir) + rightAngles(2);
        endAngle = penDirtoRad(element.endPenDir) + rightAngles(2);
        strokeColor = colorDB.mGy;
        isPalmSide = false;
        displayRotArc();
        displayRotPoint();
        displayRotArrow();
    }
};

const redisplayCanvas = () => {
    clearCanvas();
    displayBaseLine();
    ntnElements.forEach((element, index) => {
        displayHoldLine(element, index);
        displayHoldPoints(element, index);
        displayBetweenPoints(element, index);
        displayRot(element, index);
    })
};

redisplayCanvas();









const RHModeButton = document.getElementById("toggleRightHandMode");
const SCModeButton = document.getElementById("toggleSmoothConnectionMode");
const DAModeButton = document.getElementById("doubleArcMode");

RHModeButton.addEventListener("click", () => {
    isRightHandMode = !isRightHandMode;
    RHModeButton.textContent = isRightHandMode ? "現在：右手モード" : "現在：左手モード";
    redisplayCanvas();
});

DAModeButton.addEventListener("click", () => {
    isdoubleArcMode = !isdoubleArcMode;
    DAModeButton.textContent = isdoubleArcMode ? "現在：掌側表示モード" : "現在：両側表示モード";
    redisplayCanvas();
});


/*
SCModeButton.addEventListener("click", () => {
    isLeanMode = !isLeanMode;
    SCModeButton.textContent = isLeanMode ? "現在：見栄えモード" : "現在：指方向-方位一致モード";
    redisplayCanvas();
});
*/


























