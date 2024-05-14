
//管理
let state = [];


//stateを軌道分析表記法に変換
const concatElements = index => {
    let e = state[index];
    return (e.rdSide +
    e.ulSide +
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

//軌道分析表記法を配列に変換しstateに入れる
const splitElements = (element,index) => {
    let e = state[index];
    let n = element.replace(/^([^\.)]*)\./,'$1(-).');
    let regExp = /^([0-6]{0,2})\(([1-5]*?)-([1-5]*?)\)\.([qhva]?)([-+]?)\.([EWSNXYZKL]?)([EWSNXYZKL]*)/
    let str = n.match(regExp);
    if (regExp.test(n)){
        state.splice(index,1,{
            rdSide: str[1].charAt(0),
            ulSide: str[1].charAt(1),
            dsSide: str[2],
            pmSide: str[3],
            contact: str[4],
            rotDir: str[5],
            startPenDir: str[6].charAt(0),
            endPenDir: str[7].charAt(str[7].length-1),
        })
    } else {
        console.log('第' + (index + 1) +'項の入力表記が適切ではありません');
        state.splice(index,1,{
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
    
}




//配列例
splitElements('45.q-.SW',0)
splitElements('35(-4).q-.WW',1)
splitElements('03.q-.EW',2)
splitElements('34.q-.EW',3)
splitElements('34.q+.EW',4)
splitElements('45.q+.EN',5)





//新しいセクションの追加
const resetNotationElements = () => {
    let elements = document.querySelectorAll('#sectionList input');
    elements.forEach ((element, index) => {
        splitElements(element.value,index);
    });
}
const addSectionButton = document.getElementById('addSection');
addSectionButton.addEventListener("click", () => {
    state.push({
        rdSide: "",
        ulSide: "",
        dsSide: "",
        pmSide: "",
        contact: "q",
        rotDir: "-",
        startPenDir: "",
        endPenDir: "",
    });
    reDisplaySections();
})
const reDisplaySections = () => {
    let sectionList = document.getElementById('sectionList')
    sectionList.innerHTML = ""
    
    for (let index = 0; index < state.length; index++) {
        let listItem = document.createElement("div");
        
        let sectionInput = document.createElement("input");
        sectionInput.placeholder = "表記を入力";
        sectionInput.value = concatElements(index); //あとでforEachに変える
        sectionInput.oninput = () => {
            resetNotationElements();
            reDisplayEverything();
        }
        let upButton = document.createElement("button");
        upButton.textContent = "▲";
        upButton.onclick = () => {
            moveSectionUp(index);
            reDisplayEverything();
        }
        let downButton = document.createElement("button");
        downButton.textContent = "▼";
        downButton.onclick = () => {
            moveSectionDown(index);
            reDisplayEverything();
        }
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "×";
        deleteButton.onclick = () => {
            deleteSection(index);
            reDisplayEverything();
        }
        
        listItem.appendChild(document.createTextNode('第' + (index + 1) + '項 '));
        listItem.appendChild(sectionInput);
        listItem.appendChild(upButton);
        listItem.appendChild(downButton);
        listItem.appendChild(deleteButton);
        sectionList.appendChild(listItem);
    }
    //state.forEach((index) => { });
}
const moveSectionUp = (index) => {
    if (index > 0) {
        let temp = state[index];
        state[index] = state[index - 1];
        state[index - 1] = temp;
        reDisplaySections();
    }
}
const moveSectionDown = (index) => {
    if (index < state.length - 1) {
        let temp = state[index];
        state[index] = state[index + 1];
        state[index + 1] = temp;
        reDisplaySections();
    }
}
const deleteSection = (index) => {
    state.splice(index,1);
    reDisplaySections();
}

reDisplaySections();




//canvas
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");




//モード
let isRightHandMode = true;
let isdoubleArcMode = false;
let isLeanMode = false; //実装予定
let isConnectionMode = false; //実装予定

//色の設定
const colorDB = {
    w:"#FFFFFF",
    ltGy:"#EEEEEE",
    mGy:"#808080",
    dkGy:"#222222",
    bk:"#000000",

    dkR:"#993D3D",
    dkB:"#3D3D99",

};

//位置関係,座標の設定
const lineNum = 7;
const standardLength = canvas.width;
const marginX = standardLength/5;
const marginY = marginX;
const baseLineWidthX = (canvas.width - marginX * 2) / (lineNum - 1);
const baseLineWidthY = baseLineWidthX;
const arcRadius = baseLineWidthY / 2.5;
const pointRadius = baseLineWidthY / 10;

//汎用
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


//表記要素を座標と角度に変換(ハンドモード変更に対応済み)
const numtoX = num => {
    let pos = marginX + baseLineWidthX * parseInt(num)
    if (isRightHandMode) {
        return canvas.width - pos;
    } else {
        return pos;
    }
};
const indextoY = index => {
    return marginY + baseLineWidthY * index;
};

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



//実際の描画
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
    let strokeColor = colorDB.bk;
    let fillColor;

    let regExp = /[06]/
    
    x = numtoX(element.rdSide);
    fillColor = regExp.test(element.rdSide) ? colorDB.w : colorDB.bk;
    drawPoint(x,y,size,strokeColor,fillColor);
    
    x = numtoX(element.ulSide);
    fillColor = regExp.test(element.ulSide) ? colorDB.w : colorDB.bk;
    drawPoint(x,y,size,strokeColor,fillColor);
};

//内余指
const displayBetweenPoints = (element, index) => {

    const displayPoint = (num,isUpSide) => {
        let size = 1.5;
        let x = numtoX(num);
        let y = indextoY(index) - (baseLineWidthY * size / 10) * sign(isUpSide);
        let strokeColor = colorDB.bk;
        let fillColor = colorDB.w;
        drawPoint(x,y,size,strokeColor,fillColor);
    }

    let strArray; 

    strArray = element.dsSide.split("");
    strArray.forEach((element) => {
        displayPoint(element,true)
    })
    
    strArray = element.pmSide.split("");
    strArray.forEach((element) => {
        displayPoint(element,false)
    })

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
        drawArc(x,y,radius,startAngle,centralAngle,strokeColor);

    }

    const displayRotPoint = () => {
        let x1 = toShiftedX(num,element.startPenDir,isPalmSide);
        let y1 = toShiftedY(index,element.startPenDir,isPalmSide);
        fillColor = strokeColor;
        if (element.startPenDir !== element.endPenDir) {drawPoint(x1,y1,size,strokeColor,fillColor)};
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

const reDisplayEverything = () => {
    clearCanvas();
    displayBaseLine();
    state.forEach((element, index) => {
        displayHoldLine(element, index);
        displayHoldPoints(element, index);
        displayBetweenPoints(element, index);
        displayRot(element, index);
    })
};
reDisplayEverything();


//ボタンの処理
const RHModeButton = document.getElementById("toggleRightHandMode");
const SCModeButton = document.getElementById("toggleSmoothConnectionMode");
const DAModeButton = document.getElementById("doubleArcMode");

RHModeButton.addEventListener("click", () => {
    isRightHandMode = !isRightHandMode;
    RHModeButton.textContent = isRightHandMode ? "現在：右手モード" : "現在：左手モード";
    reDisplayEverything();
});
DAModeButton.addEventListener("click", () => {
    isdoubleArcMode = !isdoubleArcMode;
    DAModeButton.textContent = isdoubleArcMode ? "現在：掌側表示モード" : "現在：両側表示モード";
    reDisplayEverything();
});


/*
SCModeButton.addEventListener("click", () => {
    isLeanMode = !isLeanMode;
    SCModeButton.textContent = isLeanMode ? "現在：見栄えモード" : "現在：指方向-方位一致モード";
    reDisplayEverything();
});
*/


























