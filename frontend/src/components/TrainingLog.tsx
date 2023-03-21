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

interface Obj {
  [prop: string]: any // 『[prop: string]: any』を記述してあげることでどんなプロパティも持てるようになります。
  [prop: number]: any // 『[prop: string]: any』を記述してあげることでどんなプロパティも持てるようになります。
}

interface Training {
  item: any,
}

// dayjsの言語設定。グローバルで適用する。
// メモ：モジュール化して各ページでべた書きしないようにする
dayjs.locale(ja);

const TrainingDetail = (props: Training) => {
  const trainingDate = dayjs(new Date(props.item.execute_date)).format('YYYY/MM/DD');
  const dayOfWeek = dayjs(trainingDate).format('dddd');
  let setCount: any = ['セット'];
  let weight: any = ['重量'];
  let count: any = ['回数'];
  let rest: any = ['レスト'];

  // セット、重量、回数、レストの４単位 １～１０までで１レコードとなるようにデータを成形する
  for (const [key, value] of Object.entries(props.item)) {
    if (key.match(/^setcount/)) {
      setCount.push(value);
    }
    else if (key.match(/^weight/)) {
      weight.push(value);
    }
    else if (key.match(/^playcount/)) {
      count.push(value);
    }
    else if (key.match(/^rest/)) {
      rest.push(value);
    }
  }

  const trainingLogs = [
    {...setCount},
    {...weight},
    {...count},
    {...rest},
  ];

  return (
    <>
      <div className="trainingLogHeader">
        <div className="trainingDate">{trainingDate} {dayOfWeek}</div>
        <div className="trainingEventName">{props.item.trainingEvents_name}</div>
      </div>
      {/* tebleのwidthがデフォルト状態で画面幅に応じて余分な余白ができているので今後改修予定する */}
      <TableContainer component={Paper}>
      <Table id="test" sx={{ minWidth: 950 }}>
        {trainingLogs.map((logObject) => (
        <>
          <TableBody className="table-Border" sx={{ width: 300 }}>
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
            {Object.values(logObject).map((logVal: any, index: number) => (
              <TableCell
                className ={index !== 0 ? "tableCell-basic" : 'tableCell-sideHeader'}
              >
                {logVal !== 0 ? logVal : ''}
              </TableCell>
            ))}
            </TableRow>
          </TableBody>
        </>
        ))}
      </Table>
    </TableContainer>
    <div className="trainingLogTotal flex">
      <div>ボリューム {props.item.totalWeight}kg  /</div> {/* 種目ごとのボリューム数を計算して表示 */}
      <div>推定1RM {props.item.repetitionMaximum}kg</div> {/* 種目ごとの推定1RM数を計算して表示 */}
    </div>
    </>
  )
}

const App = () => {
  const [trainingDetailData, setTrainingDetailData] = useState<Obj>([]);
  const location = useLocation();
  let query = 'date=' + location.state.date
            + '&bodyCode=' + location.state.bodyCode
            + '&eventCode=' + location.state.eventCode;
  const URL = `/api/getTrainingLogDetail?${query}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetch(URL)
        .then(res => res.json())
        .then(result => {
          setTrainingDetailData(result[0]);
        })
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [URL]);

  return (
    <>
      <Header />
      <div className="container">
        <TrainingDetail item={trainingDetailData}/>
      </div>
    </>
  );
};

export default App;