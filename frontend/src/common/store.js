

export const store={
    user:{},
    selectedTask:null,
    tasks:[],
    groups:[],
    selectedGroup:null,
    setTasks: function(tasks){
        this.tasks = tasks
        // renderList(this.tasks, todoListDiv)
    },
    deleteTask: function(id){
        this.tasks = this.tasks.filter(task => task.id !== id)
        // renderList(this.tasks, todoListDiv)
    },
    addTask: function(task){
        this.tasks.unshift(task)
        // renderTask(task, todoListDiv, false)
    },
    updateTask: function(id, updTask){
        this.tasks = this.tasks.map(task => task.id === id ? updTask : task)
        // renderList(this.tasks, todoListDiv)
    },
    setSelectedTask: function(task){
        this.selectedTask=task
    },
    setGroups: function(groups){
        this.groups = groups
        // renderGroups(this.groups)
    }, 
    selectGroup: function(group){
        this.selectedGroup = group
        // loadOneGroup(this.selectedGroup.id)
    },

}