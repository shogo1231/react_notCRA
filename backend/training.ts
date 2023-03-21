import { dbSetting } from './mysqlConfig'
import dayjs from 'dayjs';
import * as big from './bigjs'

interface Obj {
  [prop: string]: any // 『[prop: string]: any』を記述してあげることでどんなプロパティも持てるようになります。
  [prop: number]: any // 『[prop: string]: any』を記述してあげることでどんなプロパティも持てるようになります。
}
// const rowItem: Obj = {// 初期化するときにそのObjという型で宣言してあげることで、どんなプロパティでも持てる型になる
// }
interface calcRMDatas {
  weight: number
  count: number
}

/**
 * 対象日付のトレーニング履歴を取得
 */
export async function getTrainingLogData (_targetDate:any) {
  try {
    // DB接続
    const connection = await dbSetting();

    // 前方一致させたいので末尾にワイルドカードを追加する
    const targetDate = dayjs(_targetDate).format('YYYY-MM-DD') + '%';
    const query = `
      SELECT log.*, event.*, body.*
      FROM trainingLogs AS log
      LEFT JOIN trainingEvents AS event
        ON log.event_code = event.trainingEvents_code
      LEFT JOIN bodyParts AS body
        ON log.body_code = body.bodyParts_code
      where execute_date like ?;`
    let param = [targetDate];

    const rows = await connection.execute(query, param);

    let rowItems: any = rows[0];
    rowItems.forEach((rowItem: Obj) => {
      const culcResult = cultMultipleTotalVal(rowItem);
      rowItem.totalWeight = culcResult.totalWeight;
      rowItem.totalSetCount = culcResult.totalSetCount;
      rowItem.repetitionMaximum = culcResult.repetitionMaximum;
    });

    return rowItems;
  }
  catch (err: any) {
    throw new Error(err)
  }
}

interface queryParam {
  date: Date,
  bodyCode: string,
  eventCode: string,
}

/**
 * 種目ごとのトレーニング履歴を取得（日付単位）
 */
export async function getTrainingLogDetail (queryParam: queryParam) {
  try {
    // DB接続
    const connection = await dbSetting();

    const searchDate = dayjs(new Date(queryParam.date)).format('YYYY-MM-DD HH:mm:ss');
    const query = `
      SELECT log.*, event.*, body.*
      FROM trainingLogs AS log
      LEFT JOIN trainingEvents AS event
        ON log.event_code = event.trainingEvents_code
      LEFT JOIN bodyParts AS body
        ON log.body_code = body.bodyParts_code
      where log.execute_date like ?
        AND log.body_code = ?
        AND log.event_code = ?;`
    const param = [searchDate, Number(queryParam.bodyCode), Number(queryParam.eventCode)];
    const rows = await connection.execute(query, param);
    const rowItem: any = rows[0];

    // 上記クエリよりroeItemは1データしかない前提でボリュームと1RMを計算しクライアントに返す
    let editRowItem: Obj =  rowItem[0];
    // 返り値の合計セット数は使用しない想定
    const culcResult = cultMultipleTotalVal(editRowItem);
    editRowItem.totalWeight = culcResult.totalWeight;
    editRowItem.repetitionMaximum = culcResult.repetitionMaximum;

    return rowItem;
  }
  catch (err: any) {
    throw new Error(err)
  }
}

/**
 * すべてのトレーニング種目を取得
 */
export async function getAllEventItems () {
  try {
    // DB接続
    const connection = await dbSetting();
    const query = 'SELECT * FROM trainingEvents ORDER BY body_code';

    const rows = await connection.execute(query);
    const rowItem: any = rows[0];

    return rowItem;
  }
  catch (err: any) {
    throw new Error(err)
  }
}

/**
 * トレーニング履歴登録処理
 * @param sendData
 */
export async function registerTrainingLogs (sendData: Obj) {
  // DB接続
  const connection = await dbSetting();

  // 日付取得(datetime型)
  const registDate = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');

  // 送信データの整形
  const shapingData = makeRegistData(registDate, sendData);

  // テーブルのカラム名を取得
  const getColumnNameQuery = 'DESCRIBE trainingLogs';
  const getColumnName = await connection.execute(getColumnNameQuery);
  const ColumnName: any = getColumnName[0];

  // INSERT INTO以降のクエリ部分を作成
  const columns = ColumnName
  .reduce((acc: string, cur: Obj) => {
    return acc + cur.Field + ','
  }, '(')
  .slice(0, -1)
  .concat(')');

  // テーブルのカラム数を取得
  const getColumnQuery = 'select count(*) as count from information_schema.columns where table_name = "trainingLogs"';
  const getColumn = await connection.execute(getColumnQuery);
  const getCount: any = getColumn[0];
  const loopCount = getCount[0].count;

  // VALUES以降のクエリ部分を作成
  const questions = `(${'?,'.repeat(loopCount).slice(0, -1)})`;

  // データ更新クエリ
  const query = `insert into trainingLogs ${columns} VALUES ${questions}`;

  // データ更新
  await connection.execute(query, shapingData);
}

/**
 * 合計重量、合計セット数、推定1RMの計算
 * @param editRowItem
 */
function cultMultipleTotalVal(editRowItem: Obj) {
  let totalSetCount = 0;
  let totalWeight = 0;
  let totalVolume = 0;
  let maxWeightAndCount: calcRMDatas = { weight: 0, count: 0};

  for (const[key, value] of Object.entries(editRowItem)) {
    if (key.match(/^weight/)) {
      totalSetCount = value !== 0 ? totalSetCount + 1 : totalSetCount;

      let arrKey = key.split('_');
      let targetNum = arrKey[1];
      let targetPlaycount = `playcount_${targetNum}`;
      totalVolume = value * editRowItem[targetPlaycount];
      totalWeight += totalVolume;

      if (value > maxWeightAndCount.weight) {
        maxWeightAndCount.weight = value;
        maxWeightAndCount.count = editRowItem[targetPlaycount];
      }
    }
  }

  editRowItem.totalWeight = totalWeight;
  editRowItem.totalSetCount = totalSetCount;

  const repetitionMaximum = calcRepetitionMaximum(maxWeightAndCount, editRowItem.trainingEvents_name);
  editRowItem.repetitionMaximum = repetitionMaximum;

  return {
    totalWeight: editRowItem.totalWeight,
    totalSetCount: editRowItem.totalSetCount,
    repetitionMaximum: editRowItem.repetitionMaximum,
  }
}

/**
 * 種目ごとの推定1RM計算
 * @param calcRMDatas 対象種目の最大重量とレップ数
 * @param eventName トレーニング種目名
 * @description BIG3のみこのサイト(https://fwj.jp/magazine/rm/)を参考に計算。
 * その他種目に関しては一般的な理論式から計算する。
 * 詳細に出したい種目があれば分岐を追加していけばよい。
 */
function calcRepetitionMaximum (calcRMDatas: calcRMDatas, eventName: string) {
  let result: number = 0;
  const maxWeight = calcRMDatas.weight;
  const maxCount = calcRMDatas.count;
  switch (eventName) {
    case 'ベンチプレス':
      result = big.add(big.div(big.times(maxWeight, maxCount), 40), maxWeight);
      break;
    case 'スクワット':
    case 'デッドリフト':
      result = big.add(big.div(big.times(maxWeight, maxCount), 33.3), maxWeight);
      break;
    default: //　オコナ―式
      result = big.times(maxWeight, (big.add(1, big.div(maxCount, 40))));
      break;
  }
  result = big.trunc(result, 3);
  return result;
}

/**
 * クライアントから送信されたデータを登録用に整形する
 * @param date
 * @param sendData
 * @description いったんべた書きとする。柔軟性を求める方法としてDBのカラム名と
 * 送られてくるオブジェクトのkeyを等しくすることで対応出来る。将来的な課題としておく。
 */
function makeRegistData (date: any, sendData: any) {
  let result = [];

  // 日付の追加
  result.push(date);

  // bodycode、eventCodeの順に追加
  result.push(sendData.bodyCode, sendData.eventCode);

  // bodycode追加
  const logItems = sendData.logItems;
  for (let i = 1; i <= 10; i++) {
    for (let j = 0; j < logItems.length; j++) {
      result.push(logItems[j][i]);
    }
  }

  // memoの追加
  result.push(sendData.memo);

  return result;
}