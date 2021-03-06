import {NextPage} from "next";
import { Header } from "../components/Header";
import {Filters} from "../components/Filters";
import {List} from "../components/List";
import {useEffect, useState} from "react";
import {Task} from "../types/task";
import {Footer} from "../components/Footer";
import {executeRequest} from "../services/api";
import {Modal, ModalBody, ModalFooter} from "react-bootstrap";
import { HomeProps } from "../types/home-props";

export const Home: NextPage<HomeProps> = ({
  Logout
}) => {
  const [tasks,setTasks] = useState<Task[]>([]);
  const [finishPrevisionStart, setFinishPrevisionStart] = useState("");
  const [finishPrevisionEnd, setFinishPrevisionEnd] = useState("");
  const [status, setStatus] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [finishPrevisionDate, setFinishPrevisionDate] = useState("");

  useEffect(() => {
    getFilteredList();
  }, [finishPrevisionStart, finishPrevisionEnd, status]);

  const getFilteredList = async () => {
    try {
      let filters = "?status=" + status;

      if(finishPrevisionStart) {
        filters += "&finishPrevisionStart=" + finishPrevisionStart;
      }

      if(finishPrevisionEnd) {
        filters += "&finishPrevisionEnd=" + finishPrevisionEnd;
      }

      const result = await executeRequest("task" + filters, "GET");
      if(!result || !result.data) {
        return;
      }
      setTasks(result.data);
    } catch (e) {
      console.log(e);
    }
  }

  const doSave = async (e : any) =>{
    setMsgError("");
    setLoading(true);

    try{
      e.preventDefault();

      if(!name || !finishPrevisionDate){
        setMsgError('Favor preencher o nome e data de previsão');
        setLoading(false);
        return;
      }

      const body = {
        name,
        finishPrevisionDate
      }

      const result = await executeRequest('task', 'POST', body);

      if(!result || !result.data){
        setMsgError('Nao foi possivel salvar a tarefa!');
        return;
      }

      await getFilteredList();
      closeModal();

    } catch(e : any){
      if(e?.response?.data?.error){
        setMsgError(e?.response?.data?.error);
      }else{
        setMsgError('Ocorreu erro ao adicionar tarefa tente novamente!');
      }
    }

    setLoading(false);
  }

  const closeModal = () => {
    setName("");
    setFinishPrevisionDate("");
    setMsgError("");
    setShowModal(false);
  }


  return (
    <>
      <Header logout={Logout} showModal={() => setShowModal(true)}/>
      <Filters
        finishPrevisionStart={finishPrevisionStart}
        finishPrevisionEnd={finishPrevisionEnd}
        status={status}
        setStatus={setStatus}
        setFinishPrevisionStart={setFinishPrevisionStart}
        setFinishPrevisionEnd={setFinishPrevisionEnd}
      />
      <List tasks={tasks} getFilteredList={getFilteredList} />
      <Footer showModal={() => setShowModal(true)} />
      <Modal show={showModal} onHide={() => setShowModal(false)} className={"container-modal"}>
        <ModalBody>
          <p>Adicionar Tarefa</p>
          {msgError && <p className={"error"}>{msgError}</p>}
          <input type={"text"} placeholder={"Criar uma tarefa"} value={name} onChange={e => setName(e.target.value)} />
          <input
            type={"text"}
            placeholder={"Data de previsão"}
            value={finishPrevisionDate}
            onChange={e => setFinishPrevisionDate(e.target.value)}
            onFocus={e => e.target.type = "date"}
            onBlur={e => e.target.type = "text"}
          />
        </ModalBody>
        <ModalFooter>
          <div className={"button col-12"}>
            <button onClick={doSave} disabled={isLoading}>{!isLoading ? "Salvar" : "Carregando...."}</button>
            <span onClick={closeModal}>Cancelar</span>
          </div>
        </ModalFooter>
      </Modal>
    </>
  )
}
