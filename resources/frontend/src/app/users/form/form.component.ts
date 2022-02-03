import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { UsersService } from '../users.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPasswordDialogComponent } from '../confirm-password-dialog/confirm-password-dialog.component';
import { Observable, combineLatest, of, forkJoin } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from '../../auth/models/user';
import { AVATARS } from '../../avatars';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})

export class FormComponent implements OnInit {

  constructor(
    private sharedService: SharedService, 
    private usersService: UsersService,
    private authService: AuthService, 
    private route: ActivatedRoute, 
    private fb: FormBuilder,
    public dialog: MatDialog
  ) { }

  isLoading:boolean = false;
  hidePassword:boolean = true;

  authUser: User;
  
  usuario:any = {};

  usuarioForm = this.fb.group({
    'name': ['',Validators.required],
    'email': ['',[Validators.required, Validators.email]],
    'username': ['',[Validators.required, Validators.minLength(4)]],
    'password': ['',[Validators.minLength(6)]],
    'is_superuser': [false],
    'avatar': [''],
    'roles': [[]],
    'permissions': [[]],
    'direcciones': [[]],
  });

  avatarList: any[] = [];

  //Para el filtro de Roles
  catalogRoles: any[] = [];
  listOfRoles$: Observable<any[]>;
  filterInputRoles: FormControl = new FormControl('');
  filterInputRoles$: Observable<string> = this.filterInputRoles.valueChanges.pipe(startWith(''));
  filteredRoles$: Observable<any[]>;
  selectedRolesControl:any = {};
  selectedRoles: any[] = [];
  selectedRolePermissions: any[] = [];
  assignedPermissions: any[] = [];
  deniedPermissions: any[] = [];
  selectedRoleChipId: number = 0;

  selectedAvatar:string = AVATARS[0].file;

  //Para el filtro de Permisos
  catalogPermissions: any[] = [];
  listOfPermissions$: Observable<any[]>;
  filterInputPermissions: FormControl = new FormControl('');
  filterInputPermissions$: Observable<string> = this.filterInputPermissions.valueChanges.pipe(startWith(''));
  filteredPermissions$: Observable<any[]>;
  selectedPermissions: any[] = [];

  //Para el filtro de Direcciones
  catalogDirecciones: any[] = [];
  listOfDirecciones$: Observable<any[]>;
  filterInputDirecciones: FormControl = new FormControl('');
  filterInputDirecciones$: Observable<string> = this.filterInputDirecciones.valueChanges.pipe(startWith(''));
  filteredDirecciones$: Observable<any[]>;
  selectedDireccionesControl:any = {};
  selectedDirecciones: any[] = [];
  selectedDireccionProyectos: any[] = [];
  selectedDireccionTodos:boolean;
  assignedProyectos: any[] = [];
  deniedProyectos: any[] = [];
  selectedDireccionChipId: number = 0;

  ngOnInit() {
    this.authUser = this.authService.getUserData();

    this.avatarList = AVATARS;

    let callRolesCatalog = this.usersService.getAllRoles();
    let callPermissionsCatalog = this.usersService.getAllPermissions();
    //let callDireccionesCatalog = this.usersService.getAllDirecciones();
    //let httpCalls = [callRolesCatalog, callPermissionsCatalog, callDireccionesCatalog];

    let httpCalls = [callRolesCatalog, callPermissionsCatalog];

    this.route.paramMap.subscribe(params => {
      if(params.get('id')){

        let id = params.get('id');

        let callUserData = this.usersService.getUser(id);

        httpCalls.push(callUserData);
      }else{
        this.usuarioForm.get('password').setValidators([Validators.minLength(6), Validators.required]);
      }

      this.isLoading = true;

      //Calls: 0 => Roles, 1 => Permissions, 2 => Direcciones, 3 => User
      forkJoin(httpCalls).subscribe(
        results => {
          console.log(results);

          //Starts: Roles
          this.catalogRoles = results[0].data;
          this.listOfRoles$ = of(this.catalogRoles);
          this.filteredRoles$ = combineLatest(this.listOfRoles$,this.filterInputRoles$).pipe(
            map(
              ([roles,filterString]) => roles.filter(
                role => (role.name.toLowerCase().indexOf(filterString.toLowerCase()) !== -1)
              )
            )
          );
          //Ends: Roles

          //Starts: Permissions
          this.catalogPermissions = results[1].data;
          this.listOfPermissions$ = of(this.catalogPermissions);
          this.filteredPermissions$ = combineLatest(this.listOfPermissions$,this.filterInputPermissions$).pipe(
            map(
              ([permissions,filterString]) => permissions.filter(
                permission => (permission.description.toLowerCase().indexOf(filterString.toLowerCase()) !== -1) || (permission.group.toLowerCase().indexOf(filterString.toLowerCase()) !== -1)
              )
            )
          );
          //Ends: Permissions

          //Starts: Roles
          //this.catalogDirecciones = results[2].data;
          //this.listOfDirecciones$ = of(this.catalogDirecciones);
          this.filteredDirecciones$ = combineLatest(this.listOfDirecciones$,this.filterInputDirecciones$).pipe(
            map(
              ([direcciones,filterString]) => direcciones.filter(
                direccion => (direccion.descripcion.toLowerCase().indexOf(filterString.toLowerCase()) !== -1)
              )
            )
          );
          //Ends: Roles

          //Starts: User
          if(results[2]){
            console.log("aca", results[2]);
            this.usuario = results[2];
            this.usuarioForm.patchValue(this.usuario);

            this.selectedAvatar = this.usuario.avatar;
            //Load Roles
            for(let i in this.usuario.roles){
              let roleIndex = this.catalogRoles.findIndex(item => item.id == this.usuario.roles[i].id);
              this.selectRole(this.catalogRoles[roleIndex]);
            }

            this.selectedRoleChipId = 0;

            //Load Permissions
            for(let i in this.usuario.permissions){
              let permission = this.usuario.permissions[i];
              if(this.assignedPermissions[permission.id]){
                this.assignedPermissions[permission.id].active = (permission.pivot.status == 1);
              }else{
                this.assignedPermissions[permission.id] = {
                  active: (permission.pivot.status == 1)?true:false,
                  description: permission.description,
                  inRoles:[]
                }
                this.selectedPermissions.push(permission);
              }
            }

            //Load direcciones
            for(let i in this.usuario.direcciones){
              let direccion_id = this.usuario.direcciones[i].id;
              let direccion_index = this.catalogDirecciones.findIndex(item => item.id == direccion_id);
              let direccion = this.catalogDirecciones[direccion_index];
              direccion.todos = true;

              this.selectedDireccionesControl[direccion.id] = true;
              this.selectedDirecciones.push(direccion);

              for(let i in direccion.proyectos){
                let proyecto = direccion.proyectos[i];
                
                if(!this.assignedProyectos[proyecto.id]){
                  this.assignedProyectos[proyecto.id] = {
                    active: true,
                    clave: proyecto.clave,
                    descripcion: proyecto.descripcion,
                    id: proyecto.id,
                    direccion_id: proyecto.direccion_id
                  }
                }
              }
            }

            //Load proyectos
            for(let i in this.usuario.proyectos){
              let direccion_id = this.usuario.proyectos[i].direccion_id;
              
              if(!this.selectedDireccionesControl[direccion_id]){
                let direccion_index = this.catalogDirecciones.findIndex(item => item.id == direccion_id);
                let direccion = this.catalogDirecciones[direccion_index];
                direccion.todos = false;

                this.selectedDireccionesControl[direccion.id] = true;
                this.selectedDirecciones.push(direccion);
              }

              let proyecto = this.usuario.proyectos[i];
              
              if(!this.assignedProyectos[proyecto.id]){
                this.assignedProyectos[proyecto.id] = {
                  active: true,
                  clave: proyecto.clave,
                  descripcion: proyecto.descripcion,
                  id: proyecto.id,
                  direccion_id: proyecto.direccion_id
                }
              }
            }
          }
          //Ends: User

          this.isLoading = false;
        }
      );
    }); 
  }

  removeRole(index){
    let role = this.selectedRoles[index];
    this.selectedRoles.splice(index,1);
    this.selectedRolesControl[role.id] = false;

    if(role.id == this.selectedRoleChipId){
      this.selectedRoleChipId = 0;
    }

    for(let i in role.permissions){
      let permission = role.permissions[i];
      let indexOfRole = this.assignedPermissions[permission.id].inRoles.indexOf(role.id);
      this.assignedPermissions[permission.id].inRoles.splice(indexOfRole,1);

      if(this.assignedPermissions[permission.id].inRoles.length <= 0){
        delete this.assignedPermissions[permission.id];
      }
    }
    //this.usuarioForm.get('roles').patchValue(this.selectedRoles);
  }

  selectRole(role){
    //Si el Rol no esta seleccionado
    if(!this.selectedRolesControl[role.id]){

      //Lo agregamos a la lista de Roles;
      this.selectedRoles.push(role);
      this.selectedRolesControl[role.id] = true; 
      
      //Agregamos los permisos del Rol a un arreglo global de permisos
      for(let i in role.permissions){
        let permission = role.permissions[i];
        
        if(!this.assignedPermissions[permission.id]){
          this.assignedPermissions[permission.id] = {
            active: true,
            description: permission.description,
            inRoles:[role.id]
          }
        }else{
          //Si el permiso ya esta asignado es probable que este asignado desde permisos individuales
          if(this.assignedPermissions[permission.id].inRoles.length <= 0){
            let permissionIndex = this.selectedPermissions.findIndex(item => item.id == permission.id); //Si encontramos el permiso en el arreglo de permisos individuales, lo quitamos
            if(permissionIndex >= 0){
              this.selectedPermissions.splice(permissionIndex,1);
            }
          }

          this.assignedPermissions[permission.id].inRoles.push(role.id);
        }
      }

      this.showPermissionsList(role);
      //this.usuarioForm.get('roles').patchValue(this.selectedRoles);
    }else{
      //Si el rol ya esta seleccionado, lo quitamos
      let roleIndex = this.selectedRoles.findIndex(item => item.id == role.id);
      this.removeRole(roleIndex);
    }
  }

  showPermissionsList(role){ 
    this.selectedRoleChipId = role.id; 
    this.selectedRolePermissions = [];

    for(let i in role.permissions){
      let permission = role.permissions[i];
      if(this.assignedPermissions[permission.id]){
        permission.active = this.assignedPermissions[permission.id].active;
        permission.disabled = !(this.assignedPermissions[permission.id].inRoles.length > 0);
      }else{
        permission.active = false;
        permission.disabled = true;
      }
      
      this.selectedRolePermissions.push(permission);
    }
  }

  changePermissionStatus(permission){
    this.assignedPermissions[permission.id].active = !this.assignedPermissions[permission.id].active;
  }

  removePermission(index){
    let permission = this.selectedPermissions[index];
    if(this.assignedPermissions[permission.id].inRoles.length <= 0){
      if(this.assignedPermissions[permission.id].active){
        delete this.assignedPermissions[permission.id];
      }else{
        this.assignedPermissions[permission.id].active = !this.assignedPermissions[permission.id].active;
      }
    }else{
      this.assignedPermissions[permission.id].active = !this.assignedPermissions[permission.id].active;
    }

    if(!this.assignedPermissions[permission.id] || !this.assignedPermissions[permission.id].active){
      this.selectedPermissions.splice(index,1);
    }
  }

  selectPermission(permission){
    if(this.assignedPermissions[permission.id]){
      let permissionIndex = this.selectedPermissions.findIndex(item => item.id == permission.id);
      this.removePermission(permissionIndex);
    }else{
      this.selectedPermissions.push(permission);
      this.assignedPermissions[permission.id] = {
        active: true,
        description: permission.description,
        inRoles:[]
      };
    }
    //console.log(this.assignedPermissions);
  }

  removeDireccion(index){
    let direccion = this.selectedDirecciones[index];
    this.selectedDirecciones.splice(index,1);
    this.selectedDireccionesControl[direccion.id] = false;

    if(direccion.id == this.selectedDireccionChipId){
      this.selectedDireccionChipId = 0;
    }

    for(let i in direccion.proyectos){
      let proyecto = direccion.proyectos[i];
      delete this.assignedProyectos[proyecto.id];
    }
    //this.usuarioForm.get('roles').patchValue(this.selectedRoles);
  }

  selectDireccion(direccion){
    //Si la Dirección no esta seleccionada
    if(!this.selectedDireccionesControl[direccion.id]){
      direccion.todos = true;
      //Lo agregamos a la lista de Direcciones;
      this.selectedDirecciones.push(direccion);
      this.selectedDireccionesControl[direccion.id] = true; 
      
      //Agregamos los proyectos de la direccion a un arreglo global de proyectos
      for(let i in direccion.proyectos){
        let proyecto = direccion.proyectos[i];
        
        if(!this.assignedProyectos[proyecto.id]){
          this.assignedProyectos[proyecto.id] = {
            active: true,
            clave: proyecto.clave,
            descripcion: proyecto.descripcion,
            id: proyecto.id,
            direccion_id: proyecto.direccion_id
          }
        }
      }

      this.showProyectosList(direccion);
      //this.usuarioForm.get('roles').patchValue(this.selectedRoles);
    }else{
      //Si la Dirección ya esta seleccionada, la quitamos
      let direccionIndex = this.selectedDirecciones.findIndex(item => item.id == direccion.id);
      this.removeDireccion(direccionIndex);
    }
  }

  showProyectosList(direccion){ 
    this.selectedDireccionChipId = direccion.id; 
    this.selectedDireccionProyectos = [];

    this.selectedDireccionTodos = direccion.todos;

    for(let i in direccion.proyectos){
      let proyecto = direccion.proyectos[i];
      if(this.assignedProyectos[proyecto.id]){
        proyecto.active = this.assignedProyectos[proyecto.id].active;
      }else{
        proyecto.active = false;
      }
      
      this.selectedDireccionProyectos.push(proyecto);
    }
  }

  changeDireccionStatus(direccionId){
    let direccionIndex = this.selectedDirecciones.findIndex(item => item.id == direccionId);
    let direccion = this.selectedDirecciones[direccionIndex];
    direccion.todos = !direccion.todos;
    this.selectedDireccionTodos = direccion.todos;
  }

  changeProyectoStatus(proyecto){
    if(this.assignedProyectos[proyecto.id]){
      this.assignedProyectos[proyecto.id].active = !this.assignedProyectos[proyecto.id].active;
    }else{
      this.assignedProyectos[proyecto.id] = {
        active: true,
        clave: proyecto.clave,
        descripcion: proyecto.descripcion,
        id: proyecto.id,
        direccion_id: proyecto.direccion_id
      }
      if(!this.selectedDireccionesControl[proyecto.direccion_id]){
        let direccion_index = this.catalogDirecciones.findIndex(item => item.id == proyecto.direccion_id);
        let direccion = this.catalogDirecciones[direccion_index];

        this.selectedDirecciones.push(direccion);
        this.selectedDireccionesControl[direccion.id] = true;
      }
    }
  }

  accionGuardar(){
    if(this.usuarioForm.valid){
      if(this.usuarioForm.get('password').value){
        this.confirmarContrasenia();
      }else{
        this.guardarUsuario();
      }
    }
  }

  confirmarContrasenia():void {
    const dialogRef = this.dialog.open(ConfirmPasswordDialogComponent, {
      width: '500px',
      data: {password: this.usuarioForm.get('password').value}
    });

    dialogRef.afterClosed().subscribe(validPassword => {
      if(validPassword){
        this.guardarUsuario();
      }
    });
  }

  guardarUsuario(){
    this.isLoading = true;

    let roles = [];
    let permissions = {};
    let direcciones = {};

    for(let id in this.assignedPermissions){
      let permission = this.assignedPermissions[id];

      if(permission.inRoles.length <= 0 || (permission.inRoles.length > 0 && !permission.active)){
        permissions[id]={status:permission.active};
      }
      
      if(permission.inRoles.length > 0){
        for(let i in permission.inRoles){
          if(roles.indexOf(permission.inRoles[i]) < 0){
            roles.push(permission.inRoles[i]);
          }
        }
      }
    }

    for(let i in this.selectedDirecciones){
      let direccion = this.selectedDirecciones[i];
      if(direccion.todos){
        direcciones[direccion.id] = {todos:true};
      }else{
        direcciones[direccion.id] = {todos:false, proyectos:[]};
      }
    }

    for(let i in this.assignedProyectos){
      let proyecto = this.assignedProyectos[i];
      if(proyecto.active && !direcciones[proyecto.direccion_id].todos){
        direcciones[proyecto.direccion_id].proyectos.push(proyecto);
      }
    }
    
    this.usuarioForm.get('direcciones').patchValue(direcciones);
    this.usuarioForm.get('permissions').patchValue(permissions);
    this.usuarioForm.get('roles').patchValue(roles);

    this.usuarioForm.get('avatar').patchValue(this.selectedAvatar);

    if(this.usuario.id){
      this.usersService.updateUser(this.usuarioForm.value,this.usuario.id).subscribe(
        response=>{
          if(response.guardado){
            this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
            
            if(this.authUser.id == response.usuario.id){
              this.authService.updateUserData(response.usuario);
            }
          }
          
          this.isLoading = false;
        }
      );
    }else{
      this.usersService.createUser(this.usuarioForm.value).subscribe(
        response =>{
          this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
          this.usuario = response.data;
          this.isLoading = false;
        }
      );
    }
  }

  clearRolesFilter(){
    this.filterInputRoles.setValue('');
  }
  clearPermissionsFilter(){
    this.filterInputPermissions.setValue('');
  }
  clearDireccionesFilter(){
    this.filterInputDirecciones.setValue('');
  }
}