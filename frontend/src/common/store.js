

export const store={
    user:{},
    selectedTask:null,
    tasks:[],
    groups:[],
    selectedGroup:null,
    setTasks: function(tasks){
        this.tasks = tasks
    },
    deleteTask: function(id){
        this.tasks = this.tasks.filter(task => task.id !== id)
    },
    addTask: function(task){
        this.tasks.unshift(task)
    },
    updateTask: function(id, updTask){
        this.tasks = this.tasks.map(task => task.id === id ? updTask : task)
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