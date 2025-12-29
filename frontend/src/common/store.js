

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
    }, 
    setSelectedGroup: function(group){
        this.selectedGroup = group
    },
    addGroup: function(group){
        this.groups.unshift(group)
    },
    deleteGroup:function(id){
        this.groups = this.groups.filter(group => group.id !== id)
    }

}