const api = 'https://www.randyconnolly.com/funwebdev/3rd/api/shakespeare/play.php';
const NAME = 0;
const DATE = 1;

function Plays() {
  this.plays = JSON.parse(content);
  
  this.getPlays = () => this.plays;
  this.sortByName = () => this.plays.sort((play0, play1) => {
    if (play0.title > play1.title)
      return 1;
    else 
      return -1;
  });
  
  this.sortByDate = () => this.plays.sort((play0, play1) => 
    parseInt(play0.likelyDate) - parseInt(play1.likelyDate)
  );
  
  this.getPlay = (id) => this.plays.find(play => play.id === id);
}

function PlayTextStorage() {
  this.storage = window.localStorage;
   
  this.getPlay = (play_id) => {
    return JSON.parse(this.storage.getItem(play_id)); 
  };
  
  this.storePlay = (play_id, play) => {
    this.storage.setItem(play_id, JSON.stringify(play));
  };
  
}

function Controller() {
  this.plays = new Plays();
  this.lopv = new ListOfPlaysView(this);
  this.play_data = null;
  this.pt_view = new PlayTextView(this);
  this.selected_play = null;
  this.selected_play_text = null;
  this.pt_storage = new PlayTextStorage();
  
  this.showInitView = () => {  
    this.plays.sortByName();
    document.addEventListener("DOMContentLoaded", () => {
      this.setupCredits();
      this.lopv.setupEventHandlers();
      this.pt_view.unrender();
      this.lopv.showInitView(this.plays.getPlays());
    });
  };
  
  this.setupCredits = () => {
    const credit_mssg = document.querySelector("#creditMssg");
    document.querySelector("#creditButton").addEventListener("mouseover", (e) => {
      credit_mssg.style.visibility = "visible";
      setTimeout(() => {credit_mssg.style.visibility = "hidden"}, 5000);
    });
  };
  
  this.filterPlayText = (player, search_term) => {
    this.pt_view.filterPlayer(player);
    this.pt_view.highlight(search_term);
    
  };
  
  this.sectionChange = (act, scene) => {
    const selected_scene = this.selected_play_text.acts[act].scenes[scene];
    let selected_act_name = this.selected_play_text.acts[act].name;
    
    this.pt_view.displayScene(selected_act_name, selected_scene);
  };
  
  this.selectedPlayDetails = (dataset) => {
    if (this.selected_play !== null) 
      this.lopv.deselectSelectedPlay(this.selected_play);
    
    this.selected_play = this.plays.getPlay(dataset.id);
    this.lopv.selectPlay(this.selected_play);
    this.lopv.displayPlayDetails(this.selected_play);
    this.pt_view.unrender();
    this.lopv.renderPlayDetails();
  };
  
  this.selectedSortName = () => {
    this.plays.sortByName();
    
    this.lopv.displayPlayList(this.plays.getPlays());
    if (this.selected_play !== null)
      this.lopv.selectPlay(this.selected_play);
  };
  
  this.selectedSortDate = () => {
    this.plays.sortByDate();
    
    this.lopv.displayPlayList(this.plays.getPlays());
    if (this.selected_play !== null)
      this.lopv.selectPlay(this.selected_play);
  };
  
  this.showInitViewPlayText = (play_data) => {
    console.log(play_data);
    this.selected_play_text = play_data;
    this.pt_view.setupEventHandlers(play_data);
    this.pt_view.displayInitView(play_data);
    this.lopv.unrenderPlayDetails();
    this.pt_view.renderPlayText();
  };
  
  this.selectedViewPlayText = (dataset) => {
    const play_data = this.pt_storage.getPlay(dataset.id);
    
    if (play_data) {
      console.log("session storage", play_data);
      this.showInitViewPlayText(play_data);
    } else {
      fetch(`${api}?name=${dataset.id}`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          this.pt_storage.storePlay(dataset.id, data);
          this.showInitViewPlayText(data);
        });
    }
  };
  
  this.renderLOPView = () => {
    this.pt_view.unrender();
    this.lopv.renderPlayDetails();
  };
  
  this.selectedClosePtView = () => {
    this.renderLOPView();
  };
}

function PlayTextView(pt_controller) {
  this.pt_controller = pt_controller;
    
  this.displayInitView = (play_data) => {
    this.populateActList(play_data.acts);
    this.populatePlayerList(play_data.persona);
    
    this.displayShortTitle(play_data.short);
    this.displayPlayTitle(play_data.title);
    this.displayScene(play_data.acts[0].name, play_data.acts[0].scenes[0]);
  };
  
  this.setupEventHandlers = (play_data) => {
    this.populateSceneListEventHandler(play_data.acts);
    this.playSectionChangeEventHandler();
    this.filterEventHandler();
    this.closeEventHandler();
  };
  
  this.removeHighlight = () => {
    for (let p_node of document.querySelectorAll(".speech p")) {
      p_node.innerHTML = p_node.innerHTML.replaceAll(/<b>|<\/b>/g, '');
    }
  };
  
  //regex escape string found here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  this.highlight = (search_term) => {
    this.removeHighlight();
    if (search_term !== "") {
      let re = new RegExp(search_term.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      for (let p_node of document.querySelectorAll(".speech p")) {
        p_node.innerHTML = p_node.innerHTML.replaceAll(re, '<b>$&</b>');
      }
      
    }
  };
  
  this.filterPlayer = (player) => {
    for (let node of document.querySelectorAll("#sceneHere div")) {
      if (player !== "All Players") {
        if (node.dataset.player === player) {
          node.style.display = "";
        } else {
          node.style.display = "None";
        }
      } else {
        node.style.display = "";
      }
    }
  };
  
  this.displayPlayTitle = (title) => {
    document.querySelector("#playHere h2").textContent = title;
  };
  
  this.displayShortTitle = (short_title) => {
    document.querySelector("#interface h2").textContent = short_title;
  };
  
  this.displaySceneSpeeches = (speeches) => {
    
    this.clearSceneSpeeches();
    speeches.map((speech) => {
      const speech_div = document.createElement("div");
      const speech_span = document.createElement("span");
      
      speech_span.textContent = speech.speaker;
      speech_div.appendChild(speech_span);
      
      speech.lines.map((line) => {
        const line_p = document.createElement("p");
        line_p.textContent = line;
        speech_div.appendChild(line_p);
      });
      
      if (speech.stagedir) {
        const speech_em = document.createElement("em");
        speech_em.textContent = speech.stagedir;
        speech_div.appendChild(speech_em);
      }
      
      speech_div.dataset.player = speech.speaker;
      speech_div.classList.add("speech");
      document.querySelector("#sceneHere").appendChild(speech_div);
    });
  };
  
  this.clearSceneSpeeches = () => {
    for (let node of document.querySelectorAll("#sceneHere div")) {
      node.parentNode.removeChild(node);
    }
  }
  
  this.displayScene = (act_name, scene) => {
    this.displaySceneInfo(act_name, scene.name, scene.title, scene.stageDirection);
    this.displaySceneSpeeches(scene.speeches);
  };
  
  this.displaySceneInfo = (act_name, scene_name, title, stage_direction) => {
    document.querySelector("#actHere h3").textContent = act_name;
    document.querySelector("#sceneHere h4").textContent = scene_name;
    document.querySelector("#sceneHere .title").textContent = title;
    document.querySelector("#sceneHere .direction").textContent = stage_direction;
  };
  
  this.playSectionChangeEventHandler = () => {
    document.querySelector("#interface").addEventListener("change", (e) => {
      let element_id = e.target.id;
      if (element_id === "actList" || element_id === "sceneList") {
        let act_val = document.querySelector("#actList").value;
        let scene_val = document.querySelector("#sceneList").value;
        
        this.pt_controller.sectionChange(act_val, scene_val);
      }
    });
  };
  
  this.filterEventHandler = () => {
    document.querySelector("#btnHighlight").addEventListener("click", (e) => {
      let selected_player = document.querySelector("#playerList").value;
      let search_term = document.querySelector("#txtHighlight").value;
      
      this.pt_controller.filterPlayText(selected_player, search_term);
    });
  };
  
  this.closeEventHandler = () => {
    document.querySelector("#btnClose").addEventListener("click", () => {
      this.pt_controller.selectedClosePtView();
    });
  };
  
  this.populateSceneListEventHandler = (acts) => {
    const act_selector = document.querySelector("#actList");
    
    act_selector.addEventListener("change", (e) => {
      const selected_act = acts[act_selector.value];
      this.populateSceneList(selected_act.scenes);
    });
  };
  
  this.populatePlayerList = (players) => {
    const player_selector = document.querySelector("#playerList");
    const all_players = document.createElement("option");
    
    player_selector.innerHTML = "";
    all_players.textContent = "All Players";
    all_players.setAttribute("value", "All Players");
    player_selector.appendChild(all_players);
    players.map((player) => {
      const player_option = document.createElement("option");
      
      player_option.setAttribute("value", player.player);
      player_option.textContent = player.player;
      player_selector.appendChild(player_option);
    });
  }
  
  this.populateSceneList = (scenes) => {
    const scene_selector = document.querySelector("#sceneList");
    
    scene_selector.innerHTML = "";
    scenes.map((scene, index) => {
      const scene_option = document.createElement("option");
      
      scene_option.setAttribute("value", index);
      scene_option.textContent = scene.name;
      scene_selector.appendChild(scene_option);
    });
  };
  
  this.populateActList = (acts) => {
    const act_selector = document.querySelector("#actList"); 
    
    act_selector.innerHTML = "";
    acts.map((act, index) => {
      const act_option = document.createElement("option");
     
      act_option.setAttribute("value", index);
      act_option.textContent = act.name;
      act_selector.appendChild(act_option);
      
      if (index === 0)
        this.populateSceneList(act.scenes);
    });
  };
  
  this.renderPlayText = () => {
    document.querySelector("#interface").style.display = "";
    document.querySelector("#btnClose").style.display = "";
    document.querySelector("#playHere").style.display = "";
  };
  
  this.unrender = () => {
    document.querySelector("#interface").style.display = "None";
    document.querySelector("#btnClose").style.display = "None";
    document.querySelector("#playHere").style.display = "None";
  };
  
}

function ListOfPlaysView(lopv_controller) {
  this.lopv_controller = lopv_controller;
  
  this.displayPlayList = (plays) => {
    const list = document.querySelector("#playList ul");
    list.innerHTML = "";
  
    plays.map(play => {
      const play_item = document.createElement("li");
      
      play_item.dataset.id = play.id;
      if (play.filename !== "") {
        const icon = document.createElement("img");
        icon.setAttribute("src", "text_icon.png");
        play_item.appendChild(icon);
      }
      play_item.appendChild(new Text(play.title));
      list.appendChild(play_item);
    });
  };
  
  this.renderPlayDetails = () => {
    document.querySelector("#synopsis").style.display = "";
    document.querySelector("#playDetails").style.display = "";
  }
  
  this.unrenderPlayDetails = () => {
    document.querySelector("#synopsis").style.display = "None";
    document.querySelector("#playDetails").style.display = "None";
  };
  
  this.selectPlay = (play) => {
    for (let play_item of document.querySelectorAll("#playList li")) {
      if (play_item.dataset.id === play.id) {
        play_item.classList.add("selected");
        break;
      }
    }
  };
  
  this.deselectSelectedPlay = () => {
    const curr_selected = document.querySelector("#playList .selected");
    
    if (curr_selected !== null)
      curr_selected.classList.remove("selected");
  };
  
  this.showInitView = (plays) => {
    this.displayPlayList(plays);
    document.querySelector("#synopsis").style.display = "None";
    document.querySelector("#playDetails article").style.display = "None";
  };
  
  this.hideInitMssg = () => {
    document.querySelector("#playDetails article").style.display = "";
    document.querySelector("#playDetails .selectMssg").style.display = "None";
  };
  
  this.displayPlayDetails = (play) => {
    this.hideInitMssg();
    this.displaySynopsis(play.title, play.synopsis, play.filename);
    this.displayDetails(play);
  };
  
  this.displayDetails = (play) => {
    const links = [
      "wiki",
      "gutenberg",
      "shakespeareOrg"
    ];
    const link_div = document.querySelector("#playDetails div");
    
    document.querySelector("#playDetails h2").textContent = play.title;
    document.querySelector("#playDetails .textDetails").textContent = `${play.likelyDate} | ${play.genre}`;
    document.querySelector("#playDetails .description").textContent = play.desc;
    
    link_div.innerHTML = "";
    links.map(hyperlink => {
      const link = document.createElement("a");
      link.setAttribute("href", play[hyperlink]);
      link.textContent = hyperlink.replace(/^\w/, (c) => c.toUpperCase());
      link_div.appendChild(link);
    });
  };
  
  this.displaySynopsis = (title, synopsis, filename) => {    
    document.querySelector("#synopsis h2").textContent = title;
    document.querySelector("#synopsis p").textContent = synopsis;
    
    if (filename !== "") {
      document.querySelector("#btnViewPlayText").style.display = "";
    } else {
      document.querySelector("#btnViewPlayText").style.display = "None";
    }
    
  };
  
  this.setupEventHandlers = () => {
    this.setupEventHandlerSort();
    this.setupEventHandlerPlayList();
    this.setupEventHandlerViewPlayText();
  };
  
  this.setupEventHandlerViewPlayText = () => {
    document.querySelector("#btnViewPlayText").addEventListener("click", () => {
      this.lopv_controller.selectedViewPlayText(
        document.querySelector("#playList .selected").dataset
      );
    });
  };
  
  this.setupEventHandlerSort = () => {
    const sort_inputs = document.querySelectorAll("#playList input");
    
    sort_inputs[NAME].addEventListener("click", (e) => 
      this.lopv_controller.selectedSortName()
    );
    
    sort_inputs[DATE].addEventListener("click", (e) => 
      this.lopv_controller.selectedSortDate()
    );
  };
  
  this.setupEventHandlerPlayList = () => {
    document.querySelector("#playList ul").addEventListener("click", (e) => {
      if (e.target.nodeName === "LI") {
        this.lopv_controller.selectedPlayDetails(e.target.dataset);
      }
    }); 
  }; 
}

function main() {
  const c = new Controller();
  c.showInitView();
}

main();
  
