import { Injectable } from '@angular/core'
import { SearchType } from '../../core/model/search-type'
import { SearchResultComponent } from './search-result.component'
import { AppService } from '../../core/services/app/app.service'
import { CategoryService } from '../../core/services/category/category.service'
import { EventBusService } from 'ngx-eventbus'
import { Category } from '../../core/model/category.model'
import { TranslateService } from '@ngx-translate/core'
import { SectionState } from '../../core/model/section.model'

@Injectable()
export class SearchResultPresenter {

    private view: SearchResultComponent
    private searchType: SearchType
    private selectedCategory: Category
    private categoryEvent: any
    private queryEvent: any
    private currentQuery: string

    constructor(
        private appService: AppService,
        private categoryService: CategoryService,
        private eventBusService: EventBusService,
        private translateService: TranslateService
    ) { }

    init(view: SearchResultComponent, searchType: SearchType, query: string) {

        this.view = view
        this.searchType = searchType
        this.selectedCategory = this.categoryService.getSelectedCategory()
        this.currentQuery = query

        this.findApps(query)

        this.categoryEvent = this.eventBusService.addEventListener({
            name: 'categorySelected',
            callback: (category: Category) => {
                this.findByCategory(category)
            }
        })

        this.queryEvent = this.eventBusService.addEventListener({
            name: 'queryTyped',
            callback: (queryTyped: string) => {
                this.findByName(queryTyped)
            }
        })
    }

    findApps(query: string = this.currentQuery) {
        switch (this.searchType) {
            case SearchType.CATEGORY:
                this.findByCategory(this.selectedCategory)
                break

            case SearchType.NAME:
                this.findByName(query)
                break
        }
    }

    private findByCategory(category) {
        this.view.state = SectionState.LOADING
        this.appService.findByCategory(category).subscribe(apps => {
            this.view.apps = apps
            this.view.allApps = apps
            this.view.type = 'alltypes'
            this.view.title = category.name
            this.view.state = SectionState.LOADED
        }, err => {
            console.log(err)
            this.view.state = SectionState.ERROR
        }, () => {
            this.view.state = SectionState.LOADED
        })
    }

    private findByName(query: string) {
        this.view.state = SectionState.LOADING
        this.appService.findByName(query).subscribe(apps => {
            this.view.apps = apps
            this.view.allApps = apps
            this.view.type = 'alltypes'
            this.updateTitleByQuery(query)
            this.view.state = SectionState.LOADED
        }, err => {
            console.log(err)
            this.view.state = SectionState.ERROR
        }, () => {
            this.view.state = SectionState.LOADED
        })
    }

    private updateTitleByQuery(query: string) {
        this.translateService.get('PAGES.SEARCH.QUERY_TITLE', { query: query }).subscribe(title => {
            this.view.title = title
        })
    }

    destroy() {
        this.eventBusService.removeEventListener(this.categoryEvent)
        this.eventBusService.removeEventListener(this.queryEvent)
    }
}
