class DOMHelper{
static clearEventListeners(element){
  const clonedElement=element.cloneNode(true);
  element.replaceWith(clonedElement);
  return clonedElement;
}

  static moveElement(elementId,newDestinationSelector){
    const element=document.getElementById(elementId);
    const destination=document.querySelector(newDestinationSelector);
    destination.append(element);
  }
}

class Component{
  constructor(hostElementId,insertbefore=false){ 
    if(hostElementId){
      this.hostElementId=document.getElementById(hostElementId);
    }else{this.hostElementId=document.body;}
    this.insertbefore=insertbefore;


  }
  detach=()=>{
    this.element.remove();
    this.closeNotifier();  
  
  }

  atach(){
    this.hostElementId.insertAdjacentElement(this.insertbefore?'afterbegin':'beforeend',this.element);
  }
}

class Tooltip extends Component{
  constructor(closeNotifierFunction,text,hostElement){
    super(hostElement);
    this.text=text;
   this.closeNotifier=closeNotifierFunction;
   this.create();
  }

  create(){
    const tooltipElement=document.createElement('div');
    tooltipElement.className='card';
    tooltipElement.textContent=this.text;
    tooltipElement.addEventListener('click',this.detach);
    this.element=tooltipElement;
  }
  
  
}

class ProjectItem{
  hasTooltip=false;
  constructor(id,updateProjectListFunction,type){
    this.id=id;
    this.updateprojectlistHandler=updateProjectListFunction;
    this.connectMoreInfoButton();
    this.connectSwitchButton(type);
    this.connectDrag();

  }

   showMoreInfo(){
    if(this.hasTooltip){
      return;
    }
    const projectElement=document.getElementById(this.id);
    const tooltipText=projectElement.dataset.extraInfo;
   const tooltip=new Tooltip(()=>{this.hasTooltip=false;},tooltipText,this.id);
   tooltip.atach();
   this.hasTooltip=true;
   }

   connectDrag(){
    document.getElementById(this.id).addEventListener('dragstart',event => {
      event.dataTransfer.setData('text/plane',this.id);
      event.dataTransfer.effectAllowed='move';
    })
   }

   connectMoreInfoButton(){
    const projectItemelement=document.getElementById(this.id);
    const moreInfoButton=projectItemelement.querySelector('button:first-of-type');
    moreInfoButton.addEventListener('click',this.showMoreInfo.bind(this))
   }

   connectSwitchButton(type){
    const projectItemElement=document.getElementById(this.id);
    let switchButton=projectItemElement.querySelector("button:last-of-type");
    switchButton=DOMHelper.clearEventListeners(switchButton);
    switchButton.textContent=type === 'active'?"Finished":"Activated";
    switchButton.addEventListener("click",this.updateprojectlistHandler.bind(null,this.id));
   }

   update(switchProjectListsFn,type){
      this.updateprojectlistHandler=switchProjectListsFn;
      this.connectSwitchButton(type);
   }
}

class ProjectList{
  projects=[];
  constructor(type){
    this.type=type;
    const prjItems=document.querySelectorAll(`#${type}-projects li`);
    for(const prjItem of prjItems){
      this.projects.push(new ProjectItem(prjItem.id,this.switchProjects.bind(this),this.type));
    }
    this.connectDroppable()
  }

  connectDroppable(){
    const list=document.querySelector(`#${this.type}-projects ul`);

    list.addEventListener('dragenter',event =>{
      event.preventDefault();
      list.parentElement.classList.add('droppable');
    })

    list.addEventListener('dragover',event => {
      event.preventDefault();
    })

    list.addEventListener('dragleave',event => {
      if(event.relatedTarget.closest(`#${this.type}-projects ul`)!==list){
        list.parentElement.classList.remove('droppable');
      }
    })

    list.addEventListener('drop',event => {
      const prjId=event.dataTransfer.getData('text/plane');
      if(this.projects.find(p=>p.id===prjId)){
        return;
      }
      document.getElementById(prjId).querySelector('button:last-of-type').click();
      list.parentElement.classList.remove('droppable');
      event.preventDefault();
    })
  }

  setSwitchHandlerFunction(switchHandlerFunction){
    this.switchHandler=switchHandlerFunction;
  }

  addProject(project){
    this.projects.push(project);
    DOMHelper.moveElement(project.id,`#${this.type}-projects ul`);
    project.update(this.switchProjects.bind(this),this.type)
  }

  switchProjects(projectId){
    this.switchHandler(this.projects.find(p => p.id === projectId));
    this.projects=this.projects.filter(p => p.id !== projectId);
  }
}

class App{
 static init(){
  const activeList=new ProjectList('active');
  const finishedList=new ProjectList('finished');
  activeList.setSwitchHandlerFunction(finishedList.addProject.bind(finishedList));
  finishedList.setSwitchHandlerFunction(activeList.addProject.bind(activeList));
 };
}

App.init();