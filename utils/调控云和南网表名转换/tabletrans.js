function convertTableName(oldName) {
    // 定义映射关系
    const A_DICT = {
        'SG': 'CSG'
    };

    const B_DICT = {
        'ORG': 'INST',
        'CON': 'GRP',
        'PRT': 'PROT',
        'DEV': 'EQP',
        'SSD': 'CTE',
        'DA': 'DS',
        'AUT': 'ISE',
        'COM': 'PUB',
        'HVDC': 'DCEQP',
        'HZ': 'SUM',
        'SYS': 'ISYS',
        'RPT': 'STAT',
        'SCS': 'SCSYS',
        'EVN': 'EVT',
        'TMS': 'NET',
        'R': 'RELA',
        'TCDEV': 'ICEQP',
        'TCCON': 'ICGRP',
        'APP': 'STD',
        'DEPRO': 'DFT',
        'ACC': 'ACI',
        'DIC': 'DICT'
    };

    const D_DICT = {
        'B': 'BAS',
        'P': 'PAR',
        'M': 'MOD',
        'S': 'STAT',
        'H': 'HIS',
        'R': 'REL',
    };

    // 将表名按下划线分割
    const parts = oldName.split('_').map(item => item.toUpperCase());
    const newParts = oldName.split('_').map(item => item.toUpperCase());

    // 提取各段

    const oldA = parts[0];
    const oldB = parts[1];
    // 进行映射
    const newA = A_DICT[oldA] || oldA;
    const newB = B_DICT[oldB] || oldB;
    newParts[0] = newA;
    newParts[1] = newB;
    for (i = 2; i < parts.length; i++) {
        newParts[i] = D_DICT[parts[i]] || parts[i];
    }
    // 组合新的表名
    const newName = newParts.join('_');
    return newName;
}

function convertTableNameBack(newName) {
    // 定义逆向映射关系
    const A_DICT_REVERSE = {
        'CSG': 'SG'
    };

    const B_DICT_REVERSE = {
        'INST': 'ORG',
        'GRP': 'CON',
        'PROT': 'PRT',
        'EQP': 'DEV',
        'CTE': 'SSD',
        'DS': 'DA',
        'ISE': 'AUT',
        'PUB': 'COM',
        'DCEQP': 'HVDC',
        'SUM': 'HZ',
        'ISYS': 'SYS',
        'STAT': 'RPT',
        'SCSYS': 'SCS',
        'EVT': 'EVN',
        'NET': 'TMS',
        'RELA': 'R',
        'ICEQP': 'TCDEV',
        'ICGRP': 'TCCON',
        'STD': 'APP',
        'DFT': 'DEPRO',
        'ACI': 'ACC',
        'DICT': 'DIC'
    };

    const D_DICT_REVERSE = {
        'BAS': 'B',
        'PAR': 'P',
        'MOD': 'M',
        'STAT': 'S',
        'HIS': 'H',
        'REL': 'R',
    };

    // 将表名按下划线分割
    const parts = newName.split('_').map(item => item.toUpperCase());
    const oldParts = newName.split('_').map(item => item.toUpperCase());

    // 提取各段
    const newA = parts[0];
    const newB = parts[1];
    // 进行逆向映射
    const oldA = A_DICT_REVERSE[newA] || newA;
    const oldB = B_DICT_REVERSE[newB] || newB;
    oldParts[0] = oldA;
    oldParts[1] = oldB;
    for (let i = 2; i < parts.length; i++) {
        oldParts[i] = D_DICT_REVERSE[parts[i]] || parts[i];
    }
    // 组合旧的表名
    const oldName = oldParts.join('_');
    return oldName;
}
