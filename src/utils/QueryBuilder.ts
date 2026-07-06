import { Document, Model } from 'mongoose';

interface QueryParams {
  search?: string;
  sort?: string;
  page?: string | number;
  limit?: string | number;
  [key: string]: unknown;
}

/**
 * Generic, reusable query builder for Search, Filter, Sort & Pagination.
 * Works against any Mongoose Model.
 *
 * Usage:
 *   const qb = new QueryBuilder(Product, req.query)
 *     .search(['name', 'sku'])
 *     .filter(['category'])
 *     .sort();
 *   const { data, meta } = await qb.execute();
 */
export class QueryBuilder<T extends Document> {
  private model: Model<T>;
  private queryParams: QueryParams;
  private conditions: Record<string, unknown>[] = [];
  private sortStr = '-createdAt';
  private page = 1;
  private limit = 10;

  constructor(model: Model<T>, queryParams: QueryParams) {
    this.model = model;
    this.queryParams = queryParams;
  }

  search(searchableFields: string[]) {
    const { search } = this.queryParams;
    if (search && searchableFields.length) {
      this.conditions.push({
        $or: searchableFields.map((field) => ({
          [field]: { $regex: search, $options: 'i' },
        })),
      });
    }
    return this;
  }

  filter(filterableFields: string[]) {
    for (const field of filterableFields) {
      const value = this.queryParams[field];
      if (value !== undefined && value !== '') {
        this.conditions.push({ [field]: value });
      }
    }
    return this;
  }

  sort() {
    if (this.queryParams.sort) {
      this.sortStr = (this.queryParams.sort as string).split(',').join(' ');
    }
    return this;
  }

  paginate() {
    this.page = Number(this.queryParams.page) || 1;
    this.limit = Number(this.queryParams.limit) || 10;
    return this;
  }

  private buildFilter() {
    return this.conditions.length ? { $and: this.conditions } : {};
  }

  async execute() {
    if (!this.queryParams.page && !this.queryParams.limit) {
      this.page = 1;
      this.limit = 10;
    } else {
      this.paginate();
    }

    const filter = this.buildFilter();
    const skip = (this.page - 1) * this.limit;

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(this.sortStr).skip(skip).limit(this.limit),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages: Math.ceil(total / this.limit) || 1,
      },
    };
  }
}
