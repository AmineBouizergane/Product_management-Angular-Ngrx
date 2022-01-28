import { Component, OnInit } from '@angular/core';
import {ProductsService} from '../../services/products.service';
import {Product} from '../../model/product.model';
import {Observable, of} from 'rxjs';
import {catchError, map, startWith} from 'rxjs/operators';
import {ActionEvent, AppDataState, DataStateEnum, ProductActionsTypes} from '../../state/products.state';
import {Router} from '@angular/router';
import {EventDriverService} from '../../state/event.driver.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  products$:Observable<AppDataState<Product[]>> |null=null;

  constructor(private productsService: ProductsService, private router:Router,
              private eventDrivenService:EventDriverService) { }

  ngOnInit(): void {
    this.eventDrivenService.sourceEventSubject.subscribe((actionEvent:ActionEvent)=>{
      this.onActionEvent(actionEvent);
    });
  }

  onGetAllProducts() {
    this.products$=this.productsService.getAllProducts()
      .pipe(
        map(data=>({dataState:DataStateEnum.LOADED, data:data})),
        startWith({dataState:DataStateEnum.LOADING}),
          catchError(err=>of({dataState:DataStateEnum.ERROR, errorMessage:err.message}))
      );

  }

  onGetSelectedProducts() {
      this.products$=this.productsService.getSelectedProducts()
        .pipe(
          map(data=>({dataState:DataStateEnum.LOADED, data:data})),
          startWith({dataState:DataStateEnum.LOADING}),
          catchError(err=>of({dataState:DataStateEnum.ERROR, errorMessage:err.message}))
        );
    }

  onGetAvailableProducts() {
    this.products$=this.productsService.getAvailableProducts()
      .pipe(
        map(data=>({dataState:DataStateEnum.LOADED, data:data})),
        startWith({dataState:DataStateEnum.LOADING}),
        catchError(err=>of({dataState:DataStateEnum.ERROR, errorMessage:err.message}))
      );
  }

  onSearch(dataForm: any) {
    this.products$=this.productsService.searchProducts(dataForm.keyword)
      .pipe(
        map(data=>({dataState:DataStateEnum.LOADED, data:data})),
        startWith({dataState:DataStateEnum.LOADING}),
        catchError(err=>of({dataState:DataStateEnum.ERROR, errorMessage:err.message}))
      );
  }

  onSelect(p: Product) {
    this.productsService.select(p)
      .subscribe(data=>{
        p.selected=data.selected;
      })
  }

  onDelete(p: Product) {
    let v=confirm("Etes vous sure?");
    if(v)
      this.productsService.delete(p)
        .subscribe(data=>{
          this.onGetAllProducts()
        })
  }

  onNewProduct() {
    this.router.navigateByUrl("/newProduct");
  }



  onEdit(p: Product) {
    this.router.navigateByUrl("/editProduct/"+p.id);
  }

  onActionEvent($event: any) {
    switch ($event.type){
      case ProductActionsTypes.GET_ALL_PRODUCT: this.onGetAllProducts(); break;
      case ProductActionsTypes.GET_AVAILABLE_PRODUCT: this.onGetAvailableProducts(); break;
      case ProductActionsTypes.GET_SLECTED_PRODUCT: this.onGetSelectedProducts(); break;
      case ProductActionsTypes.NEW_PRODUCT: this.onNewProduct(); break;
      case ProductActionsTypes.SEARCH_PRODUCT: this.onSearch($event.payload); break;
      case ProductActionsTypes.SELECT_PRODUCT: this.onSelect($event.payload); break;
      case ProductActionsTypes.EDIT_PRODUCT: this.onEdit($event.payload); break;
      case ProductActionsTypes.DELETE_PRODUCT: this.onDelete($event.payload); break;
    }
  }
}
