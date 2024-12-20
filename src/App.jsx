import { useEffect, useRef, useState } from 'react'
import './App.css'

// 1. Todo 생성 / 조회 / 수정 / 삭제 (**CRUD**) 기능을 구현하세요.
// 2. **현재 시간 표시, 타이머, 스톱워치** 중 하나 이상의 기능을 구현하세요.
// 3. **랜덤 명언**을 표시할 수 있는 컴포넌트를 만드세요.
// 4. **useState**, **useEffect**, **useRef**를 각각 한 번 이상 사용하세요.
// 5. 자유롭게 적용해보고 싶은 CSS를 작성해보세요.

function App() {
  // 서버에서 데이터를 받아와서 렌더링 할 수 있도록
  const [isLoading, data] = useFetch("http://localhost:3000/todo") // 데이터를 서버에서 받아오기만 한다.
  const [todo, setTodo] = useState([]) // 화면에 리렌더링 해주는 역할
  const [currentTodo, setCurrentTodo] = useState(null)
  const [time, setTime] = useState(0)
  const [isTimer, setIsTimer] = useState(false)

  // 시간소모시 리스트도 시간 소모하게
  useEffect(() => {
    if(currentTodo){
      fetch(`http://localhost:3000/todo/${currentTodo}`, {
      method: "PATCH",
      body: JSON.stringify({
        time: todo.find((el) => el.id === currentTodo)
        .time + 1,
      }),
    })
    .then(res => res.json())
    .then(res => 
      setTodo((prev) => 
        prev.map ((el) => (el.id === currentTodo ? res : el))
    )
  )}
     
  }, [time])

  useEffect(() => {
    setTime(0)
  }, [isTimer])


   // 아이디와 컨텐츠를 갖는 객체를 넣어준다. useState([여기있던부분)
    // {
    //   id: Number(new Date()), content:'안녕하세요'
    // }, // 인풋 값 추가
    useEffect(() => {
      if (data) setTodo(data)
    }, [isLoading])

  return (
    <>
    <h1>오늘 뭐 할끄냐?</h1>
    <Clock />
    <div className='advice-wrapper'>
    <h2 className="advice advice1">이거슨 오늘의 명언?!</h2>
    <Advice />
    </div>

    <button onClick={() => setIsTimer(prev => !prev)}>
      {isTimer ? '스톱워치로변경' : '타이머로 변경'}</button>
      {isTimer ? (<Timer time={time} setTime={setTime} />) :
      (<StopWatch time={time} setTime={setTime} />)}
    

  {/* todoinput에서 투두를 수정하는 함수를 내려받을 수 있도록 만들기 */}
  <TodoInput setTodo={ setTodo } /> 
  {/* todo리스트에 todo 내려주기*/}
  <TodoList todo={todo} setTodo={setTodo} setCurrentTodo={setCurrentTodo}
  currentTodo={currentTodo}/>
    </>
  )
}

// 인풋, 추가 입력하는 부분
const TodoInput = ({setTodo}) => { // settodo 받아오기
  //인풋 요소 가져오기
  const inputRef = useRef(null)
  const addTodo = () => { // 버튼 클릭시 인풋의 값 가져다 쓰기.
    const newTodo = { // 클릭이 되었을때 인풋에 담긴 값을 지정형태로 추가 해주도록 한다.
      // 타임항목 추가 (time: 0)
      content: inputRef.current.value,time: 0
    }
    // json서버에 넣기
    fetch("http://localhost:3000/todo", {
      method: "POST",
      body: JSON.stringify(newTodo),
    })
    .then(res => res.json())
    .then(res => setTodo((prev) => [...prev, res]))
  };

  return (
    <>
    {/* input에 inpitRef연결하기 */}
    <input ref={inputRef}/>
    <button onClick={addTodo}>추가</button>
    </>
  )
}

// 투두 쇼시하는 부분. 리스트
const TodoList = ({todo, setTodo, setCurrentTodo, currentTodo}) => {
  return(
    <>
    <ul>
        {todo.map((el) => (
          // 각각의 todo정보가 필요. settodo함수 필요.
        <Todo key={el.id} 
        todo={el} 
        setTodo={setTodo} 
        currentTodo={currentTodo}
        setCurrentTodo={setCurrentTodo}/>
      )
      )}
      </ul>
    </>
  )
}

// 리스트 목록
const Todo = ({ todo, setTodo, setCurrentTodo, currentTodo }) => {
  return (
    <>
    <li className={currentTodo === todo.id ? 'current': ""}>
      <div>
        {todo.content}
        <br />
        {formatTime(todo.time)}
      </div>
      <div>
      <button onClick={(() => setCurrentTodo(todo.id))}
        >시작하기</button>
      <button onClick={() => { 
            fetch(`http://localhost:3000/todo/${todo.id}`, {
              method: "DELETE",
            }).then(res => {
              if (res.ok) {
                setTodo(prev => prev.filter(el => el.id !== todo.id))
              }
            })
            /* 삭제함수. id를 사용해서 삭제하기.
            상태변경 함수(setTodo)를 가져와 원래 상태값을 가져와서 
            필터를 통해 삭제하고 싶은 리스트를 걸러 낸 새로운 값 넣어주기*/
         //   setTodo(prev => prev.filter(el => el.id !== todo.id)) 
          /* 원래 상태값의 요소들과 삭제버튼을 누른 투두 아이디와 일치 하지 않는 요소만 남긴다*/
          }}>삭제</button>
      </div>
          
        </li>
    </>
  )
}


// 커스텀 훅 만들어서 명언 만들기
const useFetch = (url) => {
  const [isLoading, setisLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(url)
    .then(res => res.json())
    .then(res => {setData(res)
      setisLoading(false)
    })
  }, [url])
  return [isLoading, data]
}

// 랜덤명언
const Advice = () => {
  const [isLoading, data] =useFetch("https://korean-advice-open-api.vercel.app/api/advice")

  // const [data, setData] = useState(null)
  // useEffect(() => {
  //   fetch("https://korean-advice-open-api.vercel.app/api/advice")
  //   .then(res => res.json())
  //   .then(res => setData(res))
  // }, [])

  return (
    <>
    {!isLoading && (
      <>
      
      <div className="advice advice2">{data.message}</div>
      <div className="advice advice3">-{data.author}-</div>
      </>
    )}
    </>
  )
}

// 현재시각 구하기
const Clock = () => {
  const [time, setTime] =  useState(new Date()) 
  // new date = 현재 시간을 받아올 수 있다.

// 리렌더링 시켜 현재시간을 표시하게 만들기
  useEffect(() => {
    setInterval(() => {
      setTime(new Date()) // 1초마다 시간을 업데이트 되도록
    }, 1000) 
  }, [])

  return(
    <div className='clock'>{time.toLocaleTimeString()}</div>
  )
}

// 스톱워치 화면 표현 방식 (00:00:00)
const formatTime = (seconds) => {
  // 1시간 - 3600초, 1분 - 60초

  const timeString = 
  `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:
  ${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:
  ${String(seconds % 60).padStart(2, "0")}`;
  return timeString;
}

//스톱워치 만들기
const StopWatch = ({time, setTime}) => {
  // const [time, setTime] = useState(0)
  const [isOn, setIsOn] = useState(false) 
  // 꺼짐 켜짐 관리(꺼져이는 상태로 두기위해서 false
  const timerRef = useRef(null)

  useEffect(() => {
    if(isOn === true){
    const timerId = setInterval(() => {
      setTime((prev) => prev + 1)
    }, 1000);
    timerRef.current = timerId;
    } else {
      clearInterval(timerRef.current); // 끄기 눌렀을 때 정지
    }
    
  }, [isOn]) // 켜기를 눌렀을 작동

  return(
    <div>
      {formatTime(time)}
    <button onClick={()=> setIsOn((prev) => !prev)}>
      {isOn ? "끄기": "켜기"}</button>
    <button onClick={(() => {
      setTime(0)
      setIsOn(false)
    })}>리셋</button>
    </div>
  )
}

// 타이머 만들기
const Timer = ({time, setTime}) => {
  // 몇초를 셀것인지, 0이 되면 끝나야 된다
  const [startTime, setStartTime] = useState(0)
  const [isOn, setIsOn] = useState(false) // 일시정지, 다시시작 기능을 위해 넣어주기
  // const [time, setTime] =useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isOn && time > 0 ) {
    const timerId = setInterval(() => {
      setTime((prev) => prev - 1)
    }, 1000)
    timerRef.current = timerId
  } else if (!isOn || time == 0) {
    clearInterval(timerRef.current)
  }
  return () => clearInterval(timerRef.current)

  }, [isOn, time])

  return (
    <div>
      <div>
        {time ? formatTime(time) : formatTime(startTime)}
        <button onClick={() => {
          setIsOn(true)
          setTime(time ? time : startTime)
          setStartTime(0)
          }}>시작</button>
        <button onClick={() => setIsOn(false)}>정지</button>
        <button onClick={() => {
          setTime(0)
          setIsOn(false)
        }}>리셋</button>
        </div> 
        
      <input type="range" 
      value={startTime}
      min="0"
      max="3600"
      step="30" 
      onChange = {(event) => {
        setStartTime(event.target.value)
      }} />
    </div>
  )
}


export default App
