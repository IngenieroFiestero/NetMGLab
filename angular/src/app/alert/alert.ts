type alertType = "alert-success" | "alert-info" | "alert-warning" | "alert-danger";
export class Alert {
    name : String;
    description : String;
    type : alertType;
    constructor(name: string,description : String,type : alertType) {
        this.name = name;
        this.description = description;
        this.type = type;
    }
}