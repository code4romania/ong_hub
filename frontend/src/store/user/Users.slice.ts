import { OrderDirection } from '../../common/enums/sort-direction.enum';
import { PaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IUser } from '../../pages/users/interfaces/User.interface';

export const usersSlice = (set: any) => ({
  users: {
    items: [],
    meta: {
      currentPage: 1,
      itemCount: 0,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 1,
      orderByColumn: 'name',
      orderDirection: OrderDirection.ASC,
    },
  },
  setUsers: (users: PaginatedEntity<IUser>) => {
    set({ users });
  },
});

export default { usersSlice };
