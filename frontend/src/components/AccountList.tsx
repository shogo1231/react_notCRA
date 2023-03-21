import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import jaLocale from '@fullcalendar/core/locales/ja';
import interactionPlugin from "@fullcalendar/interaction";
import '../App.css';
import '../css/AccountList.css';
import { Stack } from '@mui/material';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import CircleIcon from '@mui/icons-material/Circle';

interface Fruit {
  id: string;
  name: string;
}

const Item = (props: any) => {
  return (
    <div className="text" >
      <h2>{props.name}</h2>
    </div>
  );
};

interface Training {
  children: never[],
  key: number,
  items: any,
  date: never,
}

const TestItem = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  margin: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const TrainingItem = (props: Training) => {
  const navigate = useNavigate();
  let setStateVal = {
    'date': props.items.execute_date,
    'bodyCode': props.items.body_code,
    'eventCode': props.items.event_code,
  };
  return (
    <div className="trainingList" onClick={() => navigate('/training/Log', {state: setStateVal})}>
      <Stack spacing={2}>
        <TestItem>
          <div className="flex">
            <div>{selectBodyPartsIcon(props.items.bodyParts_code)}</div>
            <div className="trainingName">{props.items.trainingEvents_name}</div>
          </div>
          <div className="flex">
            <div>{props.items.totalSetCount}セット  /</div> {/* 種目ごとのセット数を計算して表示 */}
            <div>ボリューム {props.items.totalWeight}kg  /</div> {/* 種目ごとのボリューム数を計算して表示 */}
            <div>推定1RM {props.items.repetitionMaximum}kg</div> {/* 種目ごとの推定1RM数を計算して表示 */}
          </div>
        </TestItem>
      </Stack>
    </div>
  );
};

function selectBodyPartsIcon(bodyPartsCode: number) {
  switch (bodyPartsCode) {
    case 1: // 胸
      return <CircleIcon style={{color: "#ef5350"}}></CircleIcon>;
    case 2: // 背中
      return <CircleIcon style={{color: "#42a5f5"}}></CircleIcon>;
    case 3: // 肩
      return <CircleIcon style={{color: "#66bb6a"}}></CircleIcon>;
    case 4: // 腕
      return <CircleIcon style={{color: "#ec407a"}}></CircleIcon>;
    case 5: // 腹
      return <CircleIcon style={{color: "#8d6e63"}}></CircleIcon>;
    case 6: // 足
      return <CircleIcon style={{color: "#7e57c2"}}></CircleIcon>;
    case 7: // 有酸素
      return <CircleIcon style={{color: "#ffa726"}}></CircleIcon>;
    case 8: // よくやる種目
      return <CircleIcon style={{color: "#26c6da"}}></CircleIcon>;
    default:
      return '';
  }
}

const App = () => {
  const [userDatas, setFruits] = useState([]);
  const [trainingDatas, settrainingDatas] = useState([{}]);
  const [selectDate, setDate] = useState();
  const URL = '/api/getUser';

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetch(URL)
        .then(res => res.json())
        .then(json => {
          setFruits(json);
        })
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  // 引数infoはFullCalendarのdateClickInfoを参照しているのでanyにしておく
  const handleDateClick = (info: any) => {
    console.log(info);
    setDate(info.dateStr);

    // 日付をクリックしたタイミングで日付と一致するトレーニング履歴データを取得しstateを更新しておく
    const URL = `/api/getTrainingLog?date=${info.dateStr}`;
    const fetchData = async () => {
      try {
        fetch(URL)
        .then(res => res.json())
        .then(json => {
          settrainingDatas(json);
        })
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }

  return (
    <>
      <Header />
      <div className="container fruitsList">
        <h1>アカウント情報</h1>

        {userDatas?.map((fruit: Fruit, index) => {
          return <Item key={index} name={fruit.name} ></Item>;
        })}
      </div>
      <div>
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="dayGridWeek"
          locales={[jaLocale]}
          locale='ja'
          // dateClickInfoでクリックした日付の情報を参照できる
          dateClick={(dateClickInfo) => handleDateClick(dateClickInfo)}
          // weekends={true} // 週末を強調表示する。
          titleFormat={{ // タイトルのフォーマット。
            year: 'numeric',
            month: 'short',
          }}
          // customButtons= {{ // カスタムボタン設置用
          //   'change': {
          //     text: '週表示',
          //     click: function() {
          //       alert('clicked the custom button!');
          //     }
          //   }
          // }}
          headerToolbar={{ // カレンダーのヘッダー設定。
            start: 'title',
            center: 'dayGridMonth,dayGridWeek',
            right: 'prev,next today',
          }}
          buttonText={ {
            today: '今日',
            month: '月表示',
            week: '週表示',
            list: 'リスト'
          }}
          height={ 300 }
        />
      </div>
      <br></br>
      {selectDate &&
        <>
          <h2>{selectDate || ''}</h2>
          {trainingDatas.map((trainingData: any, index: number) => {
            return <TrainingItem
              key={index}
              items={trainingData}
              date={selectDate}
            >
            </TrainingItem>;
          })}
        </>
      }
    </>
  );
};

export default App;