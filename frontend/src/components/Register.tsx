import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom"
import Header from "./Header";
import '../App.css';
import '../css/TrainingLog.css';
import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface Obj {
  [prop: string]: any // 『[prop: string]: any』を記述してあげることでどんなプロパティも持てるようになります。
  [prop: number]: any // 『[prop: string]: any』を記述してあげることでどんなプロパティも持てるようになります。
}

// dayjsの言語設定。グローバルで適用する。
// メモ：モジュール化して各ページでべた書きしないようにする
dayjs.locale(ja);

const registerData = (state: any, memo: string, bodyCode: string, eventCode: string) => {
  // material-UIのtableの各セルの値を取得する処理　現状不要だが備忘として残しておく
  // let test: HTMLTableElement = document.getElementById('test') as HTMLTableElement;

  // if (test !== null) {
  //   // rowsやcellsはArrayLikeですがIterableではないのでArray.formで配列にするとfor ofを使えます。
  //   for (let row of Array.from(test.rows)) {
  //     for (let cell of Array.from(row.cells)) {
  //       console.log(cell);
  //         // cell.textContent = 'test';
  //     }
  //   }
  // }
  const sendData = {
    bodyCode: bodyCode,
    eventCode: eventCode,
    logItems: state,
    memo: memo
  }

  try {
    fetch(`/api/registerTrainingLog`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendData)
    })
    .then(() => {
      alert('登録しました');
    })
  }
  catch (e) {
    console.error(e);
  }
  console.log(state);
}

const editTrainingLogs = (event: any, eventName: string, statement: Obj) => {
  const splitEventName = eventName.split('_');
  statement.forEach((stateVal: Obj) => {
    if (stateVal[0] !== splitEventName[0]) { return; }
    // セット数が一致するフィールドに入力値をセット
    stateVal[splitEventName[1]] = Number(event.target.value);
  });
  return statement;
}

const TrainingDetail = (props: Obj) => {
  const trainingDate = dayjs(new Date()).format('YYYY/MM/DD');
  const dayOfWeek = dayjs(trainingDate).format('dddd');

  let trainingLogs = props.stateItem;
  const [trainingLogsState, setTrainingLogsState] = useState<Obj>(trainingLogs);
  const [trainingLogsMemo, setTrainingLogsMemo] = useState('');

  // データ登録時に送信するパラメータ用
  const bodyCode = props.dataItem.bodyCode;
  const eventCode = props.dataItem.eventCode;
  return (
    <>
      <div className="trainingLogHeader">
        <div className="flexArea">
          <div className="trainingDate">{trainingDate} {dayOfWeek}</div>
          <div>
            <Button
              variant="contained"
              onClick={() =>
                registerData(trainingLogsState, trainingLogsMemo, bodyCode, eventCode)}>登録
            </Button>
          </div>
        </div>
        <div className="trainingEventName">{props.dataItem.eventName}</div>
      </div>
      {/* tebleのwidthがデフォルト状態で画面幅に応じて余分な余白ができているので今後改修予定する */}
      <TableContainer component={Paper}>
        <Table id="test" sx={{ minWidth: 950 }}>
          {trainingLogs.map((logObject: Obj, baseIndex: number) => (
          <>
            <TableBody className="table-Border" sx={{ width: 300 }}>
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
              {Object.values(logObject).map((logVal: any, index: number) => (
                <TableCell
                  className = {
                    index !== 0
                    // 登録画面ではデフォルトのpadding:16pxが不要なのでCSS分岐して消しこむ
                    ? (logVal !== 0 ? "tableCell-basic" : "tableCell-basic tableCell-input")
                    : 'tableCell-sideHeader'
                  }
                >
                  {logVal !== 0
                    ? logVal
                    : <TextField
                        id="outlined-helperText"
                        label= {baseIndex === 1 ? "kg" : baseIndex === 2 ? "回" : "秒"}
                        // input内で値が変わるたびにイベントが発動する
                        onChange={(event) => {
                            const targetEventName = logObject[0] + '_' + index.toString();
                            const editState = editTrainingLogs(event, targetEventName, trainingLogsState);
                            setTrainingLogsState(editState)
                          }
                        }
                      />
                  }
                </TableCell>
              ))}
              </TableRow>
            </TableBody>
          </>
          ))}
        </Table>
      </TableContainer>
      <div className="trainingLogMemo">
        <TextField
          id="standard-basic"
          label="メモ"
          variant="standard"
          fullWidth
          onChange={(event) => {
            setTrainingLogsMemo(event.target.value)
          }
        }
        />
      </div>
    </>
  )
}

const App = () => {
  const location = useLocation();
  const queryParam = {
    bodyCode: location.state.bodyCode,
    eventCode: location.state.eventCode,
    eventName: location.state.eventName
  }

  let setCount: any = ['セット'];
  let weight: any = ['重量'];
  let count: any = ['回数'];
  let rest: any = ['レスト'];

  // セット、重量、回数、レストの４単位 １～１０までで１レコードとなるようにデータを成形する
  // 将来的には一時保存復元に対応できるよう調整の必要あり
  for (let i = 1; i <= 10; i++) {
    setCount.push(i);
    weight.push(0);
    count.push(0);
    rest.push(0);
  }

  const trainingLogs = [
    {...setCount},
    {...weight},
    {...count},
    {...rest},
  ];

  return (
    <>
      <Header />
      <div className="container">
        <TrainingDetail dataItem={queryParam} stateItem={trainingLogs} />
      </div>
    </>
  );
};

export default App;